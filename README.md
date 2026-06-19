# SmartPresence — Student Module (Pages 1–3)

Expo app for the SmartPresence attendance system. This drop contains the
first 3 student screens, coded to match the supplied screenshots:

1. **Splash** (`app/index.tsx`) — reference `First 1.png`
2. **Login** (`app/login.tsx`) — reference `Login 2 .png`
3. **Profile Settings** (`app/profile.tsx`) — reference `Profile 3.png`

Splash auto-navigates to Login after ~2s. Login's "Sign In" button pushes
to Profile (since the Home dashboard isn't built yet, this is just a stand-in
so you can see the flow). Profile's "Sign Out" sends you back to Login.

## Stack

- Expo SDK 56 (React Native 0.85, React 19.2)
- Expo Router (file-based navigation)
- NativeWind v4 (Tailwind for React Native)
- `@expo/vector-icons` for the few icons not included in the supplied icon
  pack (bank/shield/QR badges, chevrons, pencil, key, logout) — everything
  else (envelope, lock, eye, fingerprint, graduation cap, home, etc.) uses
  your actual icon pack from `assets/icons/`.

> ⚠️ Expo ships 3 SDK releases a year. Run `npx expo-doctor@latest` after
> install — if a newer SDK has shipped since this was written, follow
> Expo's `upgrading-expo` flow rather than editing versions by hand.

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `i` / `a` for a simulator.

### Run in Chrome (web)

```bash
npm install
npx expo start --web
```

This opens the app at `http://localhost:8081` in your default browser
automatically. If it doesn't open on its own, press `w` in the terminal
after `expo start`, or paste the URL into Chrome yourself.

`react-native-web` + `react-dom` are already in `package.json`, so no
extra install step is needed beyond the regular `npm install`.

## Folder structure

```
app/
  _layout.tsx     — root stack navigator
  index.tsx       — Page 1: Splash
  login.tsx       — Page 2: Login
  profile.tsx     — Page 3: Profile Settings
components/
  Icon.tsx        — wraps the custom icon pack, recolors via tintColor
  BottomNav.tsx   — shared 4-tab bottom bar (Home/Schedule/History/Profile)
assets/
  icons/          — your icon pack, flattened + lowercase-hyphen filenames
  images/
    login-hero.png        — cropped hero photo from Login 2 .png
    avatar-placeholder.png — cropped avatar from Profile 3.png
    splash-icon.png        — cropped gradient mark from First 1.png
```

## Notes / things to wire up next

- **Auth is not wired to Keycloak yet** — the email/password fields are
  local state only. Per `AppStructure.md` / `Main_AGENTS.md`, Keycloak
  should replace this before the Sign In button does anything real.
- **Profile data is hardcoded** (name, ID, department, email, phone) —
  swap for the authenticated student's record once the API is in place.
- **Home/Schedule/History tabs** in the bottom nav currently just route
  back to `/` (Splash) since those screens aren't built yet — update
  `components/BottomNav.tsx` once they exist.
- Colors were sampled directly from the screenshots and centralized in
  `tailwind.config.js` (`ink`, `brand`, `card`, `navy`, `rose`, `mint`) —
  reuse those tokens instead of hardcoding hex values in new screens.
