# Asset Manager

## Purpose

Asset Manager is a small Expo mobile app for signed-in users. It stores and manages asset documents in firebase.

## Features

- Log in with an email address and password.
- Restore a firebase session after the app restarts.
- Log out and clear asset data from the local cache.
- List assets with the newest asset first.
- Create, view, update, and delete assets.
- Confirm a delete action before it removes an asset.
- Show loading, empty, not-found, pending, and error states.

## Technology

- Expo and React Native
- TypeScript
- Firebase authentication and cloud firestore
- React Navigation
- TanStack query
- Zustand
- Zod
- React Native Paper

## Requirements

- Node.js and npm
- A firebase project
- Firebase email/password authentication enabled
- A firestore database with suitable security rules
- Xcode for local iOS work
- Android Studio with the Android SDK and a virtual device
- JDK 17 for local Android work

## Environment setup

Copy the example file:

```sh
cp .env.example .env
```

Add the six firebase client configuration values from the firebase app settings:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

These are client configuration values. Do not add credentials or passwords to the repository. The `.env` file is ignored by Git.

## Install

```sh
npm install
```

## Run the app

Choose one platform. Start its simulator or emulator before you run the app command. Keep that command running while you use the app.

## iOS

Start an iOS simulator in Xcode. Wait for the simulator home screen, then run:

```sh
npm run ios
```

## Android

Start an Android virtual device in Android Studio. Wait for the Android home screen, then run:

```sh
npx expo start --android
```

This command uses the Expo CLI from the project. Do not use a global `expo` command.

## Firebase data

The app uses firebase authentication for email and password login. It uses the `assets` firestore collection for asset data.

Each asset document has these fields:

- `description`: a trimmed, non-empty string.
- `created`: a firestore timestamp set by the server when the asset is created.

The app changes only `description` during an update. It does not change `created`. A delete action removes the document after confirmation.

Firebase authentication and firestore security rules protect the data. Configure rules that allow only the required signed-in access before you use the app.

## Project structure

```text
src/
  app/                  App provider and router
  config/               Firebase client configuration validation
  features/
    assets/
      api/              Asset requests and validation
      components/       Asset list and detail screens
      types/            Asset types
    auth/
      api/              Login and logout requests
      components/       Login screen
      stores/           Authentication state
  lib/                  Firebase and tanstack query clients
```

Run the static checks with:

```sh
npm run lint
npm run typecheck
```

## Tests

Run all behavior tests:

```sh
npm test
```

The local tests always run. The live firebase tests run only when all six firebase values in `.env` are set. Otherwise, Vitest skips them.

Run only the live firebase asset tests:

```sh
npm run test:firebase
```

The live tests create a temporary firebase user and asset data. They remove both after the tests.
