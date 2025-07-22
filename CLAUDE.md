# SimpleScore - Firebase Analytics 설정 가이드

## 📊 Firebase Analytics 구현 완료

Firebase Analytics가 성공적으로 설정되었습니다. 다음 단계를 따라 완전히 활성화하세요.

## ✅ Firebase 설정 완료!

Firebase Analytics 설정이 완료되었습니다:
- ✅ Firebase 프로젝트 설정 완료
- ✅ `GoogleService-Info.plist` 추가됨 
- ✅ `google-services.json` 추가됨
- ✅ 환경변수로 보안 설정 분리 완료

## 🔐 보안 설정 (중요!)

Firebase 설정 정보는 환경변수로 분리되어 있습니다:

1. **`.env` 파일 설정 필요**:
   ```bash
   # .env.example을 복사하여 .env 파일 생성
   cp .env.example .env
   # Firebase Console에서 실제 값으로 수정
   ```

2. **환경변수 목록**:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

3. **보안 주의사항**:
   - `.env` 파일은 Git에 커밋되지 않음 (`.gitignore`에 추가됨)
   - 팀원들은 각자 `.env` 파일을 생성해야 함
   - 프로덕션 배포 시 환경변수를 별도로 설정해야 함

## 🧪 Firebase Analytics 테스트 방법

### 개발 환경에서 확인 (Expo Go)

**⚠️ Expo Go에서는 실제 Firebase 연결이 안 되지만, 코드 동작은 확인 가능합니다:**

1. **앱 실행 후 콘솔 확인**:
   ```
   🔥 Analytics initialized in development mode
   📱 Platform: ios
   🚀 Note: Firebase Analytics only works in EAS Development Build, not in Expo Go
   📊 Analytics Event: app_start {}
   ❌ Failed to log event app_start: [Error details]
   💡 This error is expected in Expo Go. Use EAS Development Build for Firebase Analytics.
   ```

2. **이벤트 트리거 테스트**:
   - 점수 증가/감소 → 콘솔에서 `score_increase/decrease` 이벤트 확인
   - 화면 전환 → `screen_view` 이벤트 확인
   - 타이머 조작 → `timer_start/pause/reset` 이벤트 확인

### 실제 Firebase 테스트 (EAS Development Build)

**실제 Firebase Analytics 데이터를 보려면 개발 빌드가 필요합니다:**

```bash
# EAS CLI 설치 (필요시)
npm install -g eas-cli

# EAS 로그인
eas login

# 개발 빌드 생성
eas build --profile development --platform ios    # iOS용
eas build --profile development --platform android # Android용
eas build --profile development --platform all     # 둘 다

# 빌드 완료 후 기기에 설치하여 테스트
```

### Firebase Console에서 데이터 확인

1. **실시간 데이터 확인**:
   - [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택
   - Analytics → 실시간 → 이벤트 섹션

2. **확인할 이벤트들**:
   - `app_start` - 앱 시작 시
   - `screen_view` - 화면 전환 시  
   - `score_increase/decrease` - 점수 변경 시
   - `timer_start/pause/reset` - 타이머 조작 시
   - `quarter_change` - 쿼터 변경 시

## 📈 구현된 Analytics 이벤트

### 화면 진입 이벤트
- 스코어보드 화면 진입
- 타이머 화면 진입

### 점수 관련 이벤트
- 점수 증가 (`score_increase`)
- 점수 감소 (`score_decrease`)
- 점수 리셋 (`score_reset`)

### 타이머 관련 이벤트
- 타이머 시작 (`timer_start`)
- 타이머 정지 (`timer_pause`)
- 타이머 리셋 (`timer_reset`)

### 게임 설정 이벤트
- 쿼터 변경 (`quarter_change`)
- 팀 색상 변경 (`team_color_change`)

### 앱 라이프사이클 이벤트
- 앱 시작 (`app_start`)

## ✅ Firebase Analytics 테스트 체크리스트

### 개발 환경 테스트 (Expo Go)
- [ ] 앱 시작 후 콘솔에서 "Analytics initialized" 메시지 확인
- [ ] 점수 증가/감소 시 콘솔에서 이벤트 로그 확인
- [ ] 타이머 시작/정지 시 콘솔에서 이벤트 로그 확인  
- [ ] 화면 전환 시 `screen_view` 이벤트 로그 확인
- [ ] 에러 메시지에 "expected in Expo Go" 안내 포함 확인

### EAS Development Build 테스트
- [ ] 개발 빌드 생성 성공
- [ ] 기기에 설치 및 실행 성공
- [ ] Firebase Console → Analytics → 실시간에서 이벤트 확인
- [ ] 다음 이벤트들이 실시간으로 표시되는지 확인:
  - [ ] `app_start` (앱 시작)
  - [ ] `screen_view` (화면 전환)
  - [ ] `score_increase` (점수 증가)
  - [ ] `score_decrease` (점수 감소)
  - [ ] `timer_start` (타이머 시작)
  - [ ] `timer_pause` (타이머 정지)
  - [ ] `quarter_change` (쿼터 변경)
  - [ ] `team_color_change` (색상 변경)

### 테스트 시나리오
1. **기본 플로우**:
   - 앱 시작 → 스코어보드 화면 → 점수 변경 → 타이머 화면 이동
2. **게임 시나리오**:
   - 타이머 시작 → 점수 증가 → 쿼터 변경 → 타이머 리셋
3. **설정 변경**:
   - 팀 색상 변경 → 화면 전환 → 다시 색상 변경

## 🔧 문제 해결

### Q: Expo Go에서 에러가 나요
A: **정상입니다!** Expo Go에서는 Firebase가 작동하지 않습니다. EAS Development Build를 사용하세요.

### Q: Firebase Console에서 이벤트가 보이지 않아요
A: 
- 실시간 데이터는 최대 30분 지연될 수 있습니다
- 개발 빌드를 사용하고 있는지 확인하세요 (Expo Go 아님)
- 설정 파일이 올바른 위치에 있는지 확인하세요

### Q: 빌드가 실패해요
A:
- `google-services.json`과 `GoogleService-Info.plist`가 루트에 있는지 확인
- EAS CLI가 최신 버전인지 확인: `npm install -g eas-cli@latest`

### Q: iOS에서 Analytics가 작동하지 않아요
A:
- Bundle ID가 Firebase Console과 일치하는지 확인
- `GoogleService-Info.plist`가 프로젝트 루트에 있는지 확인

## 📁 파일 구조

```
SimpleScore/
├── GoogleService-Info.plist     # Firebase iOS 설정
├── google-services.json         # Firebase Android 설정
├── src/
│   └── utils/
│       └── analytics.ts         # Analytics 유틸리티
├── app.json                     # Firebase 플러그인 설정됨
├── eas.json                     # EAS Build 설정됨
└── .gitignore                   # Firebase 설정 파일 제외됨
```

## 🎯 참고사항

- Firebase 설정 파일들은 `.gitignore`에 추가되어 있어 Git에 커밋되지 않습니다
- 팀원들은 각자 Firebase 설정 파일을 다운로드 받아야 합니다
- 프로덕션 배포 시 별도의 Firebase 프로젝트 사용을 권장합니다

---

**✅ Firebase Analytics 설정이 완료되었습니다!**
위 단계를 따라 설정 파일을 추가하고 개발 빌드를 생성하면 Analytics가 활성화됩니다.