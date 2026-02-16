# Chestnut

Weekly spending tracker for iOS.

## Development

```bash
npm install
npx expo run:ios --device "iPhone 17 Pro"   # simulator
npx expo run:ios --device                    # physical device (select from list)
```

If you get native module mismatch errors after updating dependencies, rebuild the native project:

```bash
rm -rf ios && npx expo prebuild --platform ios --clean
```

## App Store Release

1. Bump `version` in `app.json`
2. `npx expo prebuild --platform ios --clean`
3. Open `ios/Chestnut.xcworkspace` in Xcode
4. Set destination to **Any iOS Device (arm64)**
5. **Product → Archive**
6. In the Organizer, click **Distribute App** and upload to App Store Connect
7. In [App Store Connect](https://appstoreconnect.apple.com), select the new build, add release notes, and submit for review
