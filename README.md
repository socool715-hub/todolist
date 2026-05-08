# Firebase Todo List

카테고리(운동/공부/일상)로 할 일을 관리하는 간단한 웹 앱입니다.  
Firebase Realtime Database와 연동되어 추가/수정/삭제가 실시간 반영됩니다.

## 기능

- 할 일 추가
- 할 일 수정
- 할 일 삭제
- 카테고리별(운동/공부/일상) 분류 표시
- Firebase Realtime Database 실시간 동기화

## 파일 구성

- `index.html` : 화면 구조
- `style.css` : 스타일
- `script.js` : Firebase 연동 및 할 일 로직

## Firebase 설정

1. Firebase 프로젝트 생성
2. Realtime Database 생성
3. 웹 앱 등록 후 Firebase 설정값을 `script.js`의 `firebaseConfig`에 입력
4. 개발 단계에서는 Realtime Database 규칙을 테스트 모드로 설정

예시 규칙(개발용):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 실행 방법

1. 프로젝트 폴더 열기
2. `index.html`을 직접 더블클릭하지 말고 로컬 서버로 실행
   - 예: VS Code Live Server
3. 브라우저에서 앱 확인

## 참고

- `file://` 환경에서는 Firebase 모듈/네트워크 동작이 제한될 수 있습니다.
- 배포 전에는 반드시 보안 규칙을 인증 기반으로 강화하세요.
