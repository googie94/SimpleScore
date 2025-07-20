import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MinimalColorPickerProps {
  visible: boolean;
  currentColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

// HSV를 RGB로 변환
const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r, g, b;
  
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

// RGB를 HEX로 변환
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// HEX를 RGB로 변환
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// RGB를 HSV로 변환
const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  
  return [h, s, v];
};

// Simplified unified layout constants
const MODAL_CONFIG = {
  width: 300,
  height: 350,
  padding: 20,
  paletteSize: 150,
  hueBarWidth: 24,
  gap: 20,
};

export default function MinimalColorPicker({ visible, currentColor, onColorSelect, onClose }: MinimalColorPickerProps) {
  // Safe color parsing with fallbacks
  const parseColor = (color: string) => {
    try {
      const [r, g, b] = hexToRgb(color || '#3B82F6');
      const [h, s, v] = rgbToHsv(r, g, b);
      return { r, g, b, h: h || 0, s: s || 0, v: v || 1 };
    } catch {
      return { r: 59, g: 130, b: 246, h: 0, s: 0, v: 1 };
    }
  };

  const { h: initialH, s: initialS, v: initialV } = parseColor(currentColor);
  
  const [selectedHue, setSelectedHue] = useState(initialH);
  const [selectedSaturation, setSelectedSaturation] = useState(initialS);
  const [selectedValue, setSelectedValue] = useState(initialV);
  
  // Safe animated values with bounds checking
  const huePosition = useRef(new Animated.Value(Math.max(0, Math.min(1, initialH / 360)))).current;
  const palettePosition = useRef(new Animated.ValueXY({ 
    x: Math.max(0, Math.min(MODAL_CONFIG.paletteSize, initialS * MODAL_CONFIG.paletteSize)), 
    y: Math.max(0, Math.min(MODAL_CONFIG.paletteSize, (1 - initialV) * MODAL_CONFIG.paletteSize))
  })).current;
  
  // Update state when visible changes and currentColor is different
  React.useEffect(() => {
    if (visible) {
      const { h, s, v } = parseColor(currentColor);
      setSelectedHue(h);
      setSelectedSaturation(s);
      setSelectedValue(v);
      
      // Update animated positions
      Animated.timing(huePosition, {
        toValue: h / 360,
        duration: 0,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(palettePosition, {
        toValue: { 
          x: s * MODAL_CONFIG.paletteSize, 
          y: (1 - v) * MODAL_CONFIG.paletteSize 
        },
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, currentColor]);
  
  if (!visible) return null;

  const currentSelectedColor = (() => {
    try {
      const rgb = hsvToRgb(
        Math.max(0, Math.min(360, selectedHue || 0)),
        Math.max(0, Math.min(1, selectedSaturation || 0)),
        Math.max(0, Math.min(1, selectedValue || 1))
      );
      return rgbToHex(...rgb);
    } catch {
      return '#3B82F6';
    }
  })();

  // Hue bar touch handler
  const huePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationY } = evt.nativeEvent;
      const newHue = Math.max(0, Math.min(360, (locationY / MODAL_CONFIG.paletteSize) * 360));
      setSelectedHue(newHue);
      Animated.timing(huePosition, {
        toValue: newHue / 360,
        duration: 0,
        useNativeDriver: false,
      }).start();
    },
    onPanResponderMove: (evt) => {
      const { locationY } = evt.nativeEvent;
      const newHue = Math.max(0, Math.min(360, (locationY / MODAL_CONFIG.paletteSize) * 360));
      setSelectedHue(newHue);
      Animated.timing(huePosition, {
        toValue: newHue / 360,
        duration: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  // Color palette touch handler
  const palettePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newSaturation = Math.max(0, Math.min(1, locationX / MODAL_CONFIG.paletteSize));
      const newValue = Math.max(0, Math.min(1, 1 - (locationY / MODAL_CONFIG.paletteSize)));
      setSelectedSaturation(newSaturation);
      setSelectedValue(newValue);
      Animated.timing(palettePosition, {
        toValue: { x: locationX, y: locationY },
        duration: 0,
        useNativeDriver: false,
      }).start();
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newSaturation = Math.max(0, Math.min(1, locationX / MODAL_CONFIG.paletteSize));
      const newValue = Math.max(0, Math.min(1, 1 - (locationY / MODAL_CONFIG.paletteSize)));
      setSelectedSaturation(newSaturation);
      setSelectedValue(newValue);
      Animated.timing(palettePosition, {
        toValue: { x: locationX, y: locationY },
        duration: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  const handleConfirm = () => {
    onColorSelect(currentSelectedColor);
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Color Selection</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        
        {/* Current Color Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.colorPreview, { backgroundColor: currentSelectedColor }]} />
        </View>
        
        {/* Color Palette */}
        <View style={styles.paletteSection}>
          <View style={styles.colorPaletteContainer}>
          <View style={styles.paletteWrapper}>
            {/* Color Palette Background */}
            <View 
              style={[
                styles.colorPalette,
                { backgroundColor: rgbToHex(...hsvToRgb(selectedHue, 1, 1)) }
              ]}
              {...palettePanResponder.panHandlers}
            >
              {/* White Gradient */}
              <LinearGradient
                colors={['#FFFFFF', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.paletteOverlay}
              />
              {/* Black Gradient */}
              <LinearGradient
                colors={['transparent', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.paletteOverlay}
              />
              
              {/* Selection Pointer */}
              <Animated.View
                style={[
                  styles.palettePointer,
                  {
                    transform: [
                      { translateX: Animated.subtract(palettePosition.x, MODAL_CONFIG.paletteSize * 0.05) },
                      { translateY: Animated.subtract(palettePosition.y, MODAL_CONFIG.paletteSize * 0.05) }
                    ]
                  }
                ]}
              />
            </View>
          </View>
          
          {/* Hue Bar */}
          <View style={styles.hueBarContainer}>
            <View style={styles.hueBar} {...huePanResponder.panHandlers}>
              {/* Hue Bar Background */}
              <LinearGradient
                colors={['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.hueBarBackground}
              />
              
              {/* Hue Selection Pointer */}
              <Animated.View
                style={[
                  styles.huePointer,
                  {
                    transform: [
                      { translateY: Animated.multiply(huePosition, MODAL_CONFIG.paletteSize - 4) }
                    ]
                  }
                ]}
              />
            </View>
          </View>
        </View>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Select</Text>
          </TouchableOpacity>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: MODAL_CONFIG.padding,
    width: MODAL_CONFIG.width,
    height: MODAL_CONFIG.height,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: MODAL_CONFIG.gap - 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#94A3B8',
  },
  previewContainer: {
    alignItems: 'center',
    height: 10,
    justifyContent: 'center',
    marginBottom: MODAL_CONFIG.gap,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  paletteSection: {
    height: MODAL_CONFIG.paletteSize - 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MODAL_CONFIG.gap - 20,
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MODAL_CONFIG.gap,
  },
  paletteWrapper: {
    // No margin needed with gap
  },
  colorPalette: {
    width: MODAL_CONFIG.paletteSize,
    height: MODAL_CONFIG.paletteSize,
    borderRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  paletteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  palettePointer: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  hueBarContainer: {
    alignItems: 'center',
  },
  hueBar: {
    width: MODAL_CONFIG.hueBarWidth,
    height: MODAL_CONFIG.paletteSize,
    borderRadius: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hueBarBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  huePointer: {
    position: 'absolute',
    left: -3,
    width: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  footer: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});