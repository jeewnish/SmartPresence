# SmartPresence – Login Screen

Pixel-faithful recreation of the SmartPresence login screen in React Native + Expo.

## File Structure

```
SmartPresenceLogin/
├── App.js              # Entry point
├── LoginScreen.js      # Main screen – layout, entry animations, keyboard handling
├── InputField.js       # Animated input with focus border + inline icons
├── GradientButton.js   # Sign In button with pulsing glow
├── colors.js           # Design token palette
├── styles.js           # Shared StyleSheet + responsive scale helpers
├── babel.config.js     # Reanimated Babel plugin (required)
├── app.json            # Expo config
└── package.json        # Dependencies
```

## Setup

```bash
npm install
npx expo start
# Press 'a' → Android  |  'i' → iOS  |  scan QR → Expo Go
```

## Animations

| Element | Effect |
|---|---|
| Full screen | Fade-in on mount (600 ms) |
| Header | Slide down + fade in (200 ms delay), then continuous float ±5 px |
| Sheet card | Slide up + fade in (400 ms delay) |
| Input fields | Scale up 1.015× + border color on focus |
| Sign In button | Continuous glow pulse (1.8 s sine cycle) + press scale |

## Key Design Decisions

- **Sheet card** uses `cardBg: #F0EEF5` — the light lavender-gray matching the design exactly.
- **Input focus** animates `borderColor` to `#5B4FE8` with a soft `shadowOpacity` elevation glow.
- **`KeyboardAvoidingView`** with `behavior: padding` (iOS) / `height` (Android) keeps the form visible when the keyboard opens.
- All sizes use `scale()` / `vs()` relative to 375×812 baseline for full responsiveness.
