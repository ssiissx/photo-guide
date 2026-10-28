# 사진 잘 찍는 법

아이폰으로 여행 사진을 잘 찍기 위한 이론서를 휴대폰 웹앱으로 만든 것입니다.
빛, 노출, 구도, 화각, 색을 다룬 이론 29편과 상황별 케이스 14편, 촬영 전 체크리스트, 치트시트, 용어 사전이 들어 있습니다.

**열기:** https://ssiissx.github.io/photo-guide/

## 아이폰 홈 화면에 추가하기

1. Safari로 위 주소를 엽니다.
2. 아래쪽 공유 버튼(네모에 위쪽 화살표)을 누릅니다.
3. ‘홈 화면에 추가’를 고릅니다.

한 번 열어 두면 데이터가 없어도 열립니다. 체크 표시와 읽음 기록은 각자의 기기에만 저장됩니다.

## 구성

| 경로 | 내용 |
|---|---|
| `index.html`, `manifest.webmanifest`, `sw.js`, `icon-*.png`, `fonts/` | 배포되는 앱 (빌드 결과) |
| `src/content.js` | 모든 원고 |
| `src/scenes.js` | 일러스트와 도식 (모두 코드로 그린 SVG) |
| `src/app.js`, `src/style.css` | 화면, 조작 기능, 디자인 |
| `src/sw.js` | 오프라인 저장 (빌드 때 버전과 파일 목록이 채워짐) |
| `tools/fetch_fonts.py` | 앱에 쓰인 글자만 담은 글꼴 받기 |
| `tools/make_icons.py` | 홈 화면 아이콘 그리기 |
| `build.py` | `src/`를 묶어 앱 파일 만들기 |

## 다시 만들기

```bash
python tools/fetch_fonts.py            # 원고 글자가 바뀌었을 때
python tools/make_icons.py             # 아이콘을 바꿨을 때
python build.py <tabler-icons>/icons/outline
```

`build.py`에는 [Tabler Icons](https://tabler.io/icons)(MIT)의 outline SVG 폴더 경로를 넘깁니다 (`npm install @tabler/icons`).

## 라이선스

- 글꼴: Hahmlet, IBM Plex Sans KR, IBM Plex Mono, Nanum Pen Script. 모두 SIL Open Font License 1.1이며 원문은 `fonts/OFL-*.txt`에 있습니다.
- 아이콘: Tabler Icons (MIT).
- 사진은 쓰지 않았습니다. 사진가는 이름과 특징으로만 소개합니다.
