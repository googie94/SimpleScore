import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getAnalytics } from '@react-native-firebase/analytics';

// Analytics 초기화 상태
let isAnalyticsInitialized = false;
let analyticsEvents: any[] = [];

// Firebase App 초기화 확인 및 Analytics 설정
const initializeAnalytics = async () => {
  try {
    console.log('🚀 Checking Firebase App initialization...');
    
    // Firebase App 가져오기 (modular API)
    let app;
    try {
      app = getApp(); // 기본 앱 가져오기
      console.log('✅ Firebase App already initialized:', app.name);
    } catch (error) {
      console.log('❌ Firebase App not found:', error.message);
      throw error;
    }
    
    // Analytics 인스턴스 가져오기 (modular API)
    const analytics = getAnalytics(app);
    
    // Analytics 활성화 확인
    const isEnabled = await analytics.isDataCollectionEnabled();
    console.log('🔍 Analytics data collection enabled:', isEnabled);
    
    // 앱 인스턴스 ID 로그 (디버깅용)
    const appInstanceId = await analytics.getAppInstanceId();
    console.log('📱 App Instance ID:', appInstanceId?.substring(0, 8) + '...');
    
    isAnalyticsInitialized = true;
    console.log('🔥 Firebase Analytics initialized successfully');
    console.log('📱 Platform:', Platform.OS);
    console.log('🏗️ Environment:', __DEV__ ? 'Development' : 'Production');
    
    // 디버깅 뷰 활성화 (개발 환경)
    if (__DEV__) {
      await analytics.setDebugModeEnabled(true);
      console.log('🐛 Debug mode enabled');
    }
    
    return analytics;
  } catch (error) {
    console.log('❌ Firebase Analytics initialization failed:', error);
    console.log('🔧 Error details:', error.message);
    isAnalyticsInitialized = false;
    return null;
  }
};

// 앱 시작 이벤트
export const logAppStart = async () => {
  try {
    console.log('🚀 Starting Firebase Analytics initialization...');
    
    // Analytics 초기화 및 인스턴스 가져오기
    const analytics = await initializeAnalytics();
    
    if (!analytics) {
      console.log('⚠️ Analytics not initialized, logging local event only...');
      analyticsEvents.push({
        name: 'app_open_failed',
        params: { error: 'Analytics not initialized', platform: Platform.OS },
        time: new Date()
      });
      return;
    }
    
    const params = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: '1.0.0'
    };
    
    // 표준 Firebase Analytics 이벤트 사용
    await analytics.logEvent('app_open', params);
    
    console.log('✅ Successfully logged app_open event');
    console.log('📊 Event params:', params);
    
    // 추가 사용자 속성 설정
    await analytics.setUserProperty('platform', Platform.OS);
    await analytics.setUserProperty('app_version', '1.0.0');
    
    // 이벤트 기록 (디버깅용)
    analyticsEvents.push({
      name: 'app_open',
      params,
      time: new Date()
    });
    
    console.log('📈 Total events logged:', analyticsEvents.length);
    
  } catch (error) {
    console.log('❌ Failed to log app_start event:', error);
    console.log('🔧 Error details:', error.message || 'Unknown error');
    
    // 에러 상황에서도 로컬 로그는 유지
    analyticsEvents.push({
      name: 'app_open_failed',
      params: { error: error.message, platform: Platform.OS },
      time: new Date()
    });
  }
};

// 화면 조회 이벤트
export const logScreenView = async (screenName: string) => {
  try {
    if (!isAnalyticsInitialized) {
      console.log('⚠️ Analytics not initialized for screen view, attempting...');
      const analytics = await initializeAnalytics();
      if (!analytics) {
        console.log('⚠️ Analytics initialization failed, logging locally only');
        analyticsEvents.push({
          name: 'screen_view_failed',
          params: { screen_name: screenName, error: 'Analytics not initialized' },
          time: new Date()
        });
        return;
      }
    }
    
    const app = getApp();
    const analytics = getAnalytics(app);
    const params = {
      screen_name: screenName,
      screen_class: screenName,
    };
    
    // Firebase Analytics 표준 screen_view 이벤트
    await analytics.logScreenView(params);
    
    console.log('✅ Successfully logged screen_view event');
    console.log('📱 Screen:', screenName);
    
    // 이벤트 기록 (디버깅용)
    analyticsEvents.push({
      name: 'screen_view',
      params: { ...params, timestamp: new Date().toISOString() },
      time: new Date()
    });
    
    console.log('📈 Total events logged:', analyticsEvents.length);
    
  } catch (error) {
    console.log('❌ Failed to log screen_view event:', error);
    console.log('🔧 Screen name:', screenName, 'Error:', error.message || 'Unknown error');
    
    // 로컬 로그 유지
    analyticsEvents.push({
      name: 'screen_view_failed',
      params: { screen_name: screenName, error: error.message },
      time: new Date()
    });
  }
};

// 개발용: 로그된 이벤트 확인
export const getLoggedEvents = () => {
  console.log('📊 Analytics Events Summary:');
  console.log('- Total events:', analyticsEvents.length);
  console.log('- Events:', analyticsEvents.map(e => `${e.name} (${e.time.toLocaleTimeString()})`));
  return analyticsEvents;
};

// 개발용: Analytics 상태 확인
export const getAnalyticsStatus = async () => {
  try {
    if (!isAnalyticsInitialized) {
      const analytics = await initializeAnalytics();
      if (!analytics) {
        return {
          initialized: false,
          platform: Platform.OS,
          eventCount: analyticsEvents.length,
          isDevelopment: __DEV__,
          error: 'Analytics initialization failed'
        };
      }
    }
    
    const app = getApp();
    const analytics = getAnalytics(app);
    const appInstanceId = await analytics.getAppInstanceId();
    const isEnabled = await analytics.isDataCollectionEnabled();
    
    const status = {
      initialized: isAnalyticsInitialized,
      platform: Platform.OS,
      eventCount: analyticsEvents.length,
      isDevelopment: __DEV__,
      appInstanceId: appInstanceId?.substring(0, 12) + '...',
      dataCollectionEnabled: isEnabled
    };
    
    console.log('🔍 Analytics Status:', status);
    return status;
  } catch (error) {
    console.log('❌ Failed to get analytics status:', error);
    return {
      initialized: isAnalyticsInitialized,
      platform: Platform.OS,
      eventCount: analyticsEvents.length,
      isDevelopment: __DEV__,
      error: error.message
    };
  }
};

// 테스트용: 즉시 이벤트 강제 전송
export const forceFlushEvents = async () => {
  try {
    console.log('🚀 Force flushing Analytics events...');
    // React Native Firebase는 자동 플러시이므로 상태만 로그
    await getAnalyticsStatus();
    console.log('✅ Events should be sent to Firebase now');
  } catch (error) {
    console.log('❌ Failed to flush events:', error);
  }
};

export default { 
  logAppStart, 
  logScreenView, 
  getLoggedEvents,
  getAnalyticsStatus,
  forceFlushEvents
};