import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { Shadows } from '../constants/Shadows';
import AppText from './common/AppText';

// ─── Color Utilities ──────────────────────────────────────────────────────────

/** HSV (h: 0–360, s: 0–1, v: 0–1) → "#RRGGBB" */
export function hsvToHex(h: number, s: number, v: number): string {
  const hi = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0,
    g = 0,
    b = 0;
  switch (hi) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  const hex2 = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
}

/** "#RRGGBB" → { r, g, b } 0–255 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16) || 0,
    g: parseInt(c.slice(2, 4), 16) || 0,
    b: parseInt(c.slice(4, 6), 16) || 0,
  };
}

/** "#RRGGBB" → { h: 0–360, s: 0–1, v: 0–1 } */
export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d + 6) % 6;
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** Pure hue as hex (s=1, v=1) */
export function hueHex(h: number): string {
  return hsvToHex(h, 1, 1);
}

// ─── ColorPicker Component ────────────────────────────────────────────────────

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SV_HEIGHT = 180;
const HUE_HEIGHT = 22;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useTheme();
  const { moderateScale, wp } = useAuthLayout();

  const pickerWidth = wp(74);

  const init = hexToHsv(value || '#2563EB');
  const [hue, setHue] = useState(init.h);
  const [sat, setSat] = useState(init.s);
  const [bri, setBri] = useState(init.v);

  // Sync state if external value prop updates
  useEffect(() => {
    const next = hexToHsv(value || '#2563EB');
    setHue(next.h);
    setSat(next.s);
    setBri(next.v);
  }, [value]);

  const hex = hsvToHex(hue, sat, bri);
  const rgb = hexToRgb(hex);

  const svLayout = useRef({ width: pickerWidth, height: SV_HEIGHT });
  const hueLayout = useRef({ width: pickerWidth, height: HUE_HEIGHT });

  const selectorLeft = sat * svLayout.current.width;
  const selectorTop = (1 - bri) * svLayout.current.height;
  const thumbLeft = (hue / 360) * hueLayout.current.width;

  const selectorSize = moderateScale(18);
  const thumbSize = moderateScale(20);

  // SV Pan
  const updateSV = useCallback(
    (lx: number, ly: number) => {
      const w = svLayout.current.width || pickerWidth;
      const h = svLayout.current.height || SV_HEIGHT;
      const newS = Math.max(0, Math.min(1, lx / w));
      const newV = Math.max(0, Math.min(1, 1 - ly / h));
      setSat(newS);
      setBri(newV);
      setHue(prevH => {
        onChange(hsvToHex(prevH, newS, newV));
        return prevH;
      });
    },
    [onChange, pickerWidth],
  );

  const svPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e =>
        updateSV(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: e =>
        updateSV(e.nativeEvent.locationX, e.nativeEvent.locationY),
    }),
  ).current;

  // Hue Pan
  const updateHue = useCallback(
    (lx: number) => {
      const w = hueLayout.current.width || pickerWidth;
      const newH = Math.max(0, Math.min(360, (lx / w) * 360));
      setHue(newH);
      setSat(prevS => {
        setBri(prevV => {
          onChange(hsvToHex(newH, prevS, prevV));
          return prevV;
        });
        return prevS;
      });
    },
    [onChange, pickerWidth],
  );

  const huePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => updateHue(e.nativeEvent.locationX),
      onPanResponderMove: e => updateHue(e.nativeEvent.locationX),
    }),
  ).current;

  return (
    <View style={{ gap: moderateScale(12) }}>
      {/* Saturation / Brightness gradient area */}
      <View
        onLayout={e => {
          svLayout.current = e.nativeEvent.layout;
        }}
        style={{
          width: pickerWidth,
          height: SV_HEIGHT,
          borderRadius: Radius.md,
          overflow: 'hidden',
        }}
        {...svPan.panHandlers}
      >
        <Svg
          width={pickerWidth}
          height={SV_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <LinearGradient id='svHue' x1='0' y1='0' x2='1' y2='0'>
              <Stop offset='0' stopColor='#FFFFFF' stopOpacity='1' />
              <Stop offset='1' stopColor={hueHex(hue)} stopOpacity='1' />
            </LinearGradient>
            <LinearGradient id='svDark' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor='#000000' stopOpacity='0' />
              <Stop offset='1' stopColor='#000000' stopOpacity='1' />
            </LinearGradient>
          </Defs>
          <Rect
            x='0'
            y='0'
            width={pickerWidth}
            height={SV_HEIGHT}
            fill='url(#svHue)'
          />
          <Rect
            x='0'
            y='0'
            width={pickerWidth}
            height={SV_HEIGHT}
            fill='url(#svDark)'
          />
        </Svg>

        <View
          pointerEvents='none'
          style={{
            position: 'absolute',
            left: selectorLeft - selectorSize / 2,
            top: selectorTop - selectorSize / 2,
            width: selectorSize,
            height: selectorSize,
            borderRadius: selectorSize / 2,
            borderWidth: 2.5,
            borderColor: '#FFFFFF',
            ...Shadows.card,
          }}
        />
      </View>

      {/* Hue slider row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(10),
        }}
      >
        <View
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: moderateScale(20),
            backgroundColor: hex,
            ...Shadows.card,
          }}
        />

        <View
          onLayout={e => {
            hueLayout.current = e.nativeEvent.layout;
          }}
          style={{
            flex: 1,
            height: HUE_HEIGHT,
            borderRadius: Radius.pill,
            overflow: 'hidden',
          }}
          {...huePan.panHandlers}
        >
          <Svg width='100%' height={HUE_HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id='hueRainbow' x1='0' y1='0' x2='1' y2='0'>
                <Stop offset='0.00' stopColor='#FF0000' />
                <Stop offset='0.17' stopColor='#FFFF00' />
                <Stop offset='0.33' stopColor='#00FF00' />
                <Stop offset='0.50' stopColor='#00FFFF' />
                <Stop offset='0.67' stopColor='#0000FF' />
                <Stop offset='0.83' stopColor='#FF00FF' />
                <Stop offset='1.00' stopColor='#FF0000' />
              </LinearGradient>
            </Defs>
            <Rect
              x='0'
              y='0'
              width='100%'
              height={HUE_HEIGHT}
              fill='url(#hueRainbow)'
            />
          </Svg>

          <View
            pointerEvents='none'
            style={{
              position: 'absolute',
              left: thumbLeft - thumbSize / 2,
              top: (HUE_HEIGHT - thumbSize) / 2,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              borderWidth: 2.5,
              borderColor: '#FFFFFF',
              backgroundColor: hueHex(hue),
              ...Shadows.button,
            }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.md,
          backgroundColor: colors.surface,
          paddingHorizontal: moderateScale(12),
          paddingVertical: moderateScale(11),
        }}
      >
        <AppText
          variant='body'
          color={colors.text}
          style={{ flex: 1, fontWeight: '500', letterSpacing: 0.5 }}
        >
          {hex}
        </AppText>
        <Ionicons
          name='copy-outline'
          size={moderateScale(17)}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );
};

export default ColorPicker;
