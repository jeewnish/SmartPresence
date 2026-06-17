# SmartPresence – AI Power System Splash Screen

A pixel-faithful recreation of the SmartPresence splash screen in React Native + Expo.

## File Structure

```
SmartPresenceSplash/
├── App.js              # Entry point
├── SplashScreen.js     # Main screen – layout, entry animations, loading bar, dots
├── AppLogo.js          # Animated diamond logo with glow rings and float effect
├── colors.js           # Design token palette (all colours in one place)
├── styles.js           # Shared StyleSheet + responsive scale helpers
├── babel.config.js     # Required Reanimated Babel plugin
├── app.json            # Expo config
└── package.json        # Dependencies
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Expo
npx expo start

# 3. Run on device / simulator
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

## Dependencies

| Package | Purpose |
|---|---|
| `expo-linear-gradient` | Background gradient, diamond logo gradient, loading bar fill |
| `react-native-reanimated` | All animations (float, pulse, fade-in, loading bar, dots) |

## Animations

| Element | Animation |
|---|---|
| Entire screen | Fade in on mount (900 ms) |
| Logo | Continuous gentle float ±9 px (2.2 s cycle) |
| Logo outer ring | Opacity breath (1.6 s cycle) |
| Glow pulse ring | Scale 1 → 1.18 with opacity fade (1.6 s cycle) |
| Title + subtitle | Slide up + fade in, 400 ms delay |
| Bottom section | Fade in, 800 ms delay |
| Inactive dots | Opacity shimmer (1.4 s cycle, staggered) |
| Loading bar | Progress 0 → 65 % over 2.8 s (Expo quad out) |

## Notes

- `babel.config.js` **must** include `'react-native-reanimated/plugin'` as the last plugin entry.
- All sizes use `scale()` / `verticalScale()` helpers relative to a 375×812 base, making the layout fully responsive across Android and iOS screen sizes.
