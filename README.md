# Fortisel

An Expo (React Native) app using Expo Router for navigation. This project targets iOS, Android, and Web.

## Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (optional, but helpful)
- Expo Go app on your device (for quick testing)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   - Press `i` to open iOS simulator (if available)
   - Press `a` to open Android emulator (if available)
   - Press `w` to open in the browser (web)

## Scripts
- `npm run dev`: Start Expo development server
- `npm run build:web`: Export a static web build to `dist/`
- `npm run lint`: Run lint checks via Expo

## Tech Stack
- React 19, React Native 0.79
- Expo 53, Expo Router 5
- React Navigation
- TypeScript

## Project Structure
```
app/                   # Expo Router-based routes
  _layout.tsx          # Root layout and navigation
  (tabs)/              # Tab screens
    index.tsx
    orders.tsx
    request.tsx
    schedule.tsx
  auth/                # Authentication screens
assets/                # Images and static assets
components/            # Reusable UI components
constants/             # Theme, config
hooks/                 # Custom hooks (e.g., API)
utils/                 # Utilities and API helpers
```

## Configuration
- Fonts: Inter via `@expo-google-fonts/inter`
- Icons: `@expo/vector-icons` and `lucide-react-native`
- Maps: `react-native-maps`

If environment variables are required, create a `.env` file in the project root. Consult your team for required keys.

## Building for Web
```bash
npm run build:web
```
The static output will be in `dist/` (or as configured by Expo).

## Troubleshooting
- If the dev server fails to start, clear caches:
  ```bash
  rm -rf node_modules && npm install
  npx expo start -c
  ```
- For iOS/Android simulators, ensure Xcode/Android Studio emulators are installed and running.

## License
Proprietary. All rights reserved. # fortisel
