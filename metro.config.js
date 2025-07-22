const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TypeScript 파일 처리를 위한 설정
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;