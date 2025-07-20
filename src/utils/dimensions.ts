import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 기준 디자인 크기 (iPhone 11)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// 가로 모드를 고려한 실제 너비/높이
const width = screenHeight > screenWidth ? screenWidth : screenHeight;
const height = screenHeight > screenWidth ? screenHeight : screenWidth;

// 스케일 팩터
const widthScale = width / guidelineBaseWidth;
const heightScale = height / guidelineBaseHeight;
const scale = Math.min(widthScale, heightScale);

export const scaleSize = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(newSize);
};

export const scaleFont = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize * 0.95)); // Android는 약간 작게
  }
  return Math.round(newSize);
};

export const windowWidth = width;
export const windowHeight = height;
export const isSmallDevice = width < 350;
export const isTablet = width >= 768;

// 안드로이드 특화 조정
export const androidScale = Platform.OS === 'android' ? 0.9 : 1;