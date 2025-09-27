# PropGo App

A simple Expo React Native app scaffolded with TypeScript. Includes basic navigation with a Home and Details screen.

## Prerequisites
- Node.js 18+
- Android: Android Studio + an emulator or a physical device with Expo Go app
- iOS (optional; macOS only): Xcode + Simulator or Expo Go on an iPhone

## Install dependencies
Dependencies are already installed by the scaffolder. If you need to reinstall:

```powershell
cd "C:\Users\Gaurav Gupta\Desktop\Propgo\propgo-app"
npm install
```

## Run the app
```powershell
cd "C:\Users\Gaurav Gupta\Desktop\Propgo\propgo-app"
npm start
```
- Press `a` to launch on Android emulator or connect an Android phone with USB debugging and open Expo Go.
- Press `w` to open the web build.

## Scripts
- `npm start` - Start the Expo dev server
- `npm run android` - Start and open on Android
- `npm run ios` - Start and open on iOS (macOS only)
- `npm run web` - Start and open in a web browser

## Project structure
- `App.tsx` - Entry file with a basic stack navigator
- `assets/` - Static assets
- `index.ts` - Expo entry

## Customize
- Edit `App.tsx` to change screens or add more.
- Install more packages as needed, for example React Navigation tabs:

```powershell
npm install @react-navigation/bottom-tabs
```

## Troubleshooting
- If the bundler is stuck, stop it and run `npm start -- --clear`.
- If Android emulator doesn’t open, start it from Android Studio first.
- Ensure your device and PC are on the same network for Expo Go.
