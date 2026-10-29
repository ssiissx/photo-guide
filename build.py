"""Build the site at the repo root from src/: index.html, manifest.webmanifest, sw.js.
usage: python build.py <tabler-icons-outline-dir>
Run tools/fetch_fonts.py first (fonts/ + src/fonts.css) and tools/make_icons.py (icon-*.png)."""
import os, re, sys, json, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
LONG = r'\\?' + '\\'
ICONS = ['book', 'sun', 'aperture', 'layout-grid', 'zoom-in', 'palette', 'mountain', 'building-arch', 'user', 'building-monument',
         'mood-smile', 'coffee', 'sunset-2', 'moon', 'building-bank', 'cloud-rain', 'run', 'users-group', 'snowflake', 'plane',
         'home', 'book-2', 'map-pin', 'checklist', 'chevron-left', 'chevron-right', 'check', 'player-play',
         'list-check', 'alert-triangle', 'users', 'notebook', 'rotate', 'search']
NAME, SHORT = '사진 잘 찍는 법', '사진 이론'
BG = '#18181a'  # the app is always dark: page, status bar and manifest share this charcoal


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def write(name, text):
    with open(os.path.join(HERE, name), 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def icons(d):
    if os.name == 'nt' and not d.startswith(LONG):
        d = LONG + os.path.abspath(d)  # icon paths exceed MAX_PATH
    out = {}
    for n in ICONS:
        with open(os.path.join(d, n + '.svg'), encoding='utf-8') as f:
            svg = f.read()
        inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1)
        inner = re.sub(r'<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*/>', '', inner)
        out[n] = re.sub(r'\s+', ' ', inner).strip()
    return out


def main():
    ic = icons(sys.argv[1])
    svg = lambda n: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ic[n]}</svg>'
    tabs = ''.join(f'<button type="button" class="tab" data-tab="{t}">{svg(i)}<span>{n}</span></button>'
                   for t, i, n in [('home', 'home', '홈'), ('theory', 'book-2', '이론'), ('cases', 'map-pin', '상황별'), ('check', 'checklist', '체크')])
    page = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{NAME}</title>
<meta name="description" content="아이폰으로 여행 사진을 잘 찍기 위한 이론서. 빛, 노출, 구도, 화각, 색과 상황별 14가지 케이스.">
<meta name="theme-color" content="{BG}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="{SHORT}">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<style>
:root {{ padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }}
[hidden] {{ display: none !important; }}
img {{ max-width: 100%; }}
{read('fonts.css')}
{read('style.css')}
</style>
</head>
<body>
<header class="bar" id="bar" hidden><div class="bar-in"><button type="button" class="back" data-back>{svg('chevron-left')}<span id="bar-back">뒤로</span></button><span class="bar-meta" id="bar-meta"></span></div></header>
<main class="wrap" id="view"></main>
<nav class="tabbar" aria-label="탭"><div class="tabbar-in">{tabs}</div></nav>
<noscript><p style="padding:2rem 1rem">이 앱은 자바스크립트가 켜져 있어야 열려요.</p></noscript>
<script>
const ICONS = {json.dumps(ic, ensure_ascii=False)};
{read('scenes.js')}
{read('content.js')}
{read('app.js')}
</script>
</body>
</html>
'''
    write('index.html', page)

    manifest = {
        'name': NAME, 'short_name': SHORT, 'lang': 'ko', 'dir': 'ltr',
        'description': '아이폰 여행 사진 이론서: 빛, 노출, 구도, 화각, 색, 상황별 케이스',
        'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
        'background_color': BG, 'theme_color': BG,
        'icons': [
            {'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}
        ]
    }
    write('manifest.webmanifest', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

    fonts = sorted('fonts/' + f for f in os.listdir(os.path.join(HERE, 'fonts')) if f.endswith('.woff2'))
    assets = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'] + fonts
    h = hashlib.sha1()
    for a in assets[1:]:
        with open(os.path.join(HERE, a), 'rb') as f:
            h.update(f.read())
    sw = read('sw.js').replace('__VERSION__', h.hexdigest()[:10]).replace('__ASSETS__', json.dumps(assets, indent=2))
    write('sw.js', sw)
    print('index.html', round(len(page.encode()) / 1024), 'KB · fonts', len(fonts), '· cache', h.hexdigest()[:10])


main()
