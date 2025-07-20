# SimpleScore

스포츠 경기를 위한 간단하고 직관적인 스코어보드 애플리케이션

## 주요 기능

- **팀 점수 관리**: 스와이프/탭 제스처로 쉽게 점수 조정
- **쿼터 시스템**: 1-9쿼터까지 지원하며 각 쿼터별 기록 추적
- **타이머 기능**: 카운트다운 사운드와 햅틱 피드백
- **팀 커스터마이징**: 팀 이름과 색상 변경 가능
- **크로스 플랫폼**: iOS와 Android 모두 지원

## 스크린샷

> 스크린샷 추가 예정

## 기술 스택

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Audio**: expo-audio
- **Haptics**: expo-haptics
- **Navigation**: React Navigation

## 시작하기

### 필요 조건

- Node.js 18 이상
- npm 또는 yarn
- Expo CLI

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/googie94/SimpleScore.git
cd SimpleScore
```

2. 의존성 설치
```bash
npm install
```

3. 앱 실행
```bash
npm start
```

4. Expo Go 앱으로 QR 코드 스캔 또는 시뮬레이터에서 실행

## 사용법

### 점수 관리
- **점수 증가**: 점수 영역 탭 또는 위로 스와이프
- **점수 감소**: 점수 영역에서 아래로 스와이프

### 팀 설정
- **팀 이름 변경**: 팀 이름 옆 편집 아이콘 탭
- **팀 색상 변경**: 팀 색상 인디케이터 탭

### 타이머 사용
- 타이머 영역 탭하여 타이머 화면으로 이동
- 5초부터 카운트다운 사운드 재생
- 0초에 최종 알람 사운드

### 쿼터 관리
- 쿼터 표시 영역 탭하여 기록 보기
- 좌우 화살표로 쿼터 변경
- Reset 버튼으로 현재 쿼터 초기화

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── MinimalColorPicker.tsx
│   └── QuarterRecordsView.tsx
├── constants/           # 상수 및 테마
│   └── theme.ts
├── navigation/          # 네비게이션 설정
│   └── AppNavigator.tsx
├── screens/            # 화면 컴포넌트
│   ├── ScoreboardScreen.tsx
│   └── TimerScreen.tsx
├── store/              # 상태 관리
│   └── gameStore.ts
├── types/              # TypeScript 타입 정의
│   └── index.ts
└── utils/              # 유틸리티 함수
    ├── dimensions.ts
    └── soundManager.ts
```

## 빌드

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### 웹
```bash
npm run web
```

## 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의

문의사항이나 버그 리포트는 [Issues](https://github.com/googie94/SimpleScore/issues) 페이지에 등록해주세요.