# 🚀 AeroSmog.AI — Google Play Store Deployment Guide

This guide walks you through building your **Android App Bundle (`.aab`)** and publishing **AeroSmog.AI** to the **Google Play Store**.

---

## 📋 Step 1: Generate Your `.aab` Bundle (Fastest Method: PWABuilder)

Google Play Store requires an **Android App Bundle (`.aab`)** signed with a release keystore.

1. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
2. Enter your live URL:
   ```
   https://aerosmog-ai-2.onrender.com
   ```
3. Click **Start**. PWABuilder will automatically validate your manifest (`manifest.json`), service worker (`sw.js`), and security headers.
4. Click **Package for Stores** $\rightarrow$ select **Google Play (Android)**.
5. In the settings panel:
   - **Package ID**: `ai.aerosmog.app`
   - **App Name**: `AeroSmog.AI`
   - **Launcher Name**: `AeroSmog`
   - **App Version**: `1.0.0`
   - **Version Code**: `1`
   - **Signing key**: Select *"Generate a new key"* (download and save the `.keystore` / credentials in a safe folder!).
6. Click **Generate Package**.
7. Download the resulting zip file. Inside you will find:
   - `app-release-signed.aab` (This is the exact file you upload to Google Play Console!)
   - `assetlinks.json` (for Digital Asset Links domain verification)

---

## 📋 Step 2: Google Play Console Setup

1. Log in to **[Google Play Console](https://play.google.com/console)** (Requires a $25 one-time developer registration fee).
2. Click **Create App**:
   - **App name**: `AeroSmog.AI: Weather & AQI`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - Accept the Developer Program Policies and click **Create App**.

---

## 📋 Step 3: Store Listing Details (Copy-Paste Ready)

### Short Description (Max 80 chars):
```
AI personalized weather and Air Quality Index (AQI) health protection platform.
```

### Full Description:
```
AeroSmog.AI is your intelligent atmospheric health companion. Combining real-time meteorological sensor data, live Air Quality Index (AQI) monitoring, and tailored medical AI intelligence, AeroSmog.AI helps you breathe safer and optimize your daily lifestyle.

KEY FEATURES:
• Hyperlocal AQI & Weather: Live PM2.5, PM10, UV index, humidity, wind, and 7-day forecasts.
• AI Voice Doctor: Audible, personalized medical advisories based on your respiratory sensitivities (asthma, allergies, elderly, children).
• AR Smog Vision: View invisible airborne particulate density mapped live into your real-world environment using interactive AR.
• Gen-Z Vibe Check: Real-time Air Aura score, Touch Grass fitness meter, OOTD drip recommendations, and Berkeley Earth cigarette equivalence counter.
• Interactive Helicopter Patrol: Live atmospheric patrol animations monitoring air pollution strata.
• OnePlus-Inspired UI: Sleek, high-performance dark atmospheric aesthetic designed for modern smartphone displays.

Protect your respiratory health every day with AeroSmog.AI.
```

### Privacy Policy URL (Mandatory):
```
https://aerosmog-ai-2.onrender.com/privacy
```

---

## 📋 Step 4: App Content & Policy Questionnaire

In the Play Console sidebar, go to **Policy and programs** $\rightarrow$ **App content**:

1. **Privacy Policy**: Enter `https://aerosmog-ai-2.onrender.com/privacy`
2. **Target Audience**: Select **13 and older** (Avoid selecting under 13 to skip COPPA family policy compliance).
3. **Data Safety**:
   - **Location**: Collected (approximate & precise) for app functionality (fetching localized AQI). Not shared with third parties. Encrypted in transit.
   - **Camera / Photos**: Optional clientside usage for AR Smog Vision. Not collected or stored.
   - **Microphone**: Optional clientside Web Speech synthesis. Not collected or stored.
4. **Government Apps**: Select **No** (This is not an official government app).
5. **Financial Features**: Select **None**.

---

## 📋 Step 5: Upload `.aab` and Release

1. In the sidebar, navigate to **Production** (or **Testing $\rightarrow$ Internal testing** first).
2. Click **Create new release**.
3. Under *App bundles*, drag and drop your **`app-release-signed.aab`** file.
4. Release name: `1.0.0 (Initial Release)`
5. Release notes:
   ```
   Initial launch of AeroSmog.AI: Personalized AI atmospheric weather, AQI health advisory, AR smog scanner, and helicopter patrol.
   ```
6. Click **Next** $\rightarrow$ **Save** $\rightarrow$ **Review and roll out release**.

Google typically reviews and approves apps within 24–48 hours!
