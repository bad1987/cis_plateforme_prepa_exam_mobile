/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#60cdff';
const successColorLight = '#4CAF50';
const successColorDark = '#66BB6A';
const errorColorLight = '#f44336';
const errorColorDark = '#ef5350';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surfaceBackground: '#f8f9fa',
    border: '#e0e0e0',
    surfacePressed: '#f0f0f0',
    success: successColorLight,
    error: errorColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1a1a1a',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    surfaceBackground: '#242424',
    border: '#333333',
    surfacePressed: '#2a2a2a',
    success: successColorDark,
    error: errorColorDark,
  },
};
