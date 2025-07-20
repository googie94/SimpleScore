import { scaleSize, scaleFont } from '../utils/dimensions';

export const theme = {
  colors: {
    // Airline dashboard style colors
    primary: '#1E3A8A',
    secondary: '#0F172A',
    tertiary: '#64748B',
    
    // 배경 및 표면
    background: '#0F172A',
    surface: '#1E293B',
    surfaceLight: '#334155',
    
    // 텍스트
    text: '#F8FAFC',
    textLight: '#94A3B8',
    textDark: '#64748B',
    textOnPrimary: '#FFFFFF',
    
    // Team colors (airline style)
    team1: '#3B82F6',
    team2: '#EF4444',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Borders and dividers
    border: '#334155',
    borderLight: '#475569',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // 그라데이션
    gradientEnd: '#475569',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: scaleFont(32),
      fontWeight: '400' as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: scaleFont(24),
      fontWeight: '400' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: scaleFont(20),
      fontWeight: '400' as const,
    },
    body: {
      fontSize: scaleFont(14),
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: scaleFont(12),
      fontWeight: '400' as const,
    },
    score: {
      fontSize: scaleFont(250),
      fontWeight: '400' as const,
      letterSpacing: -4,
      fontFamily: 'G7Segment7',
    },
    // Timer font (G7 Segment 7)
    timer: {
      fontSize: scaleFont(48),
      fontWeight: '400' as const,
      letterSpacing: 2,
      fontFamily: 'G7Segment7',
    },
    // Airline dashboard font (default font)
    dashboard: {
      fontSize: scaleFont(32),
      fontWeight: '400' as const,
      letterSpacing: 4,
    },
    label: {
      fontSize: scaleFont(10),
      fontWeight: '400' as const,
      letterSpacing: 2,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#7C73E6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#7C73E6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#7C73E6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};