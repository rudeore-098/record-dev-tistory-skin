# Record Dev Tistory Skin

개발 기록을 월별 타임라인으로 보여주는 티스토리 스킨입니다. 카테고리 트리, 글 대표이미지, 본문 목차, 다크·라이트 모드와 시리즈 진행률을 지원합니다.

## 미리보기

- 로컬: `preview/index.html`을 브라우저에서 엽니다.
- GitHub Pages: 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
- `main` 브랜치에 푸시하면 홈·글 화면 미리보기가 자동으로 배포됩니다.

Pages를 먼저 활성화하지 않으면 `Get Pages site failed: Not Found` 오류가 발생합니다. 설정을 마친 뒤 **Actions → Build skin and deploy preview → Re-run all jobs**로 실패한 실행을 다시 시작하세요.

워크플로는 Node 24 기반 액션을 사용합니다. Node 20을 다시 허용하는 `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION` 설정은 추가하지 마세요.

## 설치 파일 받기

`main` 브랜치에 푸시하면 GitHub Actions의 **Build skin and deploy preview** 작업이 실행됩니다. 완료된 실행의 **Artifacts**에서 `record-dev-tistory-skin`을 내려받을 수 있습니다.

ZIP에는 `skin.html`, `style.css`, `index.xml`, `images/config.js`, `images/script.js`만 포함됩니다.

## 티스토리 적용

1. 기존 스킨을 백업합니다.
2. 티스토리 관리의 **꾸미기 → 스킨 변경 → 스킨 등록**으로 이동합니다.
3. ZIP을 푼 뒤 `skin.html`, `style.css`, `index.xml`과 `images` 안의 파일을 등록합니다.
4. 스킨을 저장하고 적용합니다.
5. 홈 설정은 **최신 글**, 목록 구성 요소는 **목록만**으로 설정합니다.

티스토리 Open API가 종료되어 GitHub Actions에서 티스토리 스킨으로 직접 배포하는 공식 방법은 없습니다. Actions는 미리보기와 설치 ZIP 생성까지만 담당하며, 최종 등록은 티스토리 관리자에서 진행합니다.
