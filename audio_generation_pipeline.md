# Word Problems Using Addition Audio & Narration Pipeline

This document outlines the architecture and workflow of the custom text-to-speech audio narration pipeline used in the Word Problems Using Addition educational module. The system is designed to provide high-quality, perfectly synchronized, and emotionally resonant narration using ElevenLabs exclusively.

## Overview
The application utilizes an ElevenLabs-only audio pipeline:
1. **Pre-generation:** Known educational scripts (phase paragraphs and questions) are pre-generated offline using a Node.js script and stored as static `.mp3` assets to ensure zero-latency playback on all devices. Note that to save bandwidth and generation time, individual numbers (1-99) are typically *not* pre-generated in bulk.
2. **Dynamic Generation:** If a text string hasn't been pre-generated (e.g., dynamically generated questions during Play Phase, or numbers), the system generates it on-the-fly via the ElevenLabs API, provided a valid `VITE_ELEVENLABS_API_KEY` is present.
3. **No Browser Fallback:** To maintain a consistent, premium experience, there is *no* fallback to the browser's built-in Web Speech API. If an audio file is missing and no API key is provided, the engine simply skips narration silently so the user can continue without robotic voices.
4. **Synchronization:** The frontend audio engine parses an array of segments, eagerly preloading upcoming segments to eliminate latency gaps between sentences.

---

## 1. Voice Profile & Settings

- **Voice Provider:** ElevenLabs
- **Voice Name:** Alice (Clear, Engaging Educator)
- **Voice ID:** `Xb7hH8MSUJpSbSDYk0k2`
- **Model:** `eleven_multilingual_v2`

Different **speech styles** map to specific ElevenLabs emotional settings (`stability`, `similarity_boost`, `style`) optimized for young learners (6-8 years old):
- `statement` / `instruction`: Standard warmth and clarity.
- `question`: Higher pitch, slower pace.
- `encouragement`: Warm, upbeat, and excited.
- `emphasis`: Slower and highly clear.
- `thinking`: Gentle, inviting, and curious.
- `celebration`: Fast, joyful, and excited.

---

## 2. Pipeline Components

### A. Offline Generation (`scripts/generate_audio.js`)
This script automates the creation of static audio files for major phase narrations (paragraphs, main questions, UI messages). 
- It reads an array of `phrases` containing the exact `text` and intended `style`.
- Hits the direct ElevenLabs text-to-speech API utilizing the local `.env.local` variable `VITE_ELEVENLABS_API_KEY`.
- Saves the resulting `.mp3` files into `public/assets/audio/`.
- Automatically generates and writes to `src/utils/audioMap.js`.

### B. Audio Mapping (`src/utils/audioMap.js`)
This file is an auto-generated JavaScript module that exports a dictionary (`audioMap`). 
- **Key:** The exact string of text to be spoken.
- **Value:** The relative path to the pre-generated `.mp3` file (e.g., `/assets/audio/audio_welcome_to_place_..._0.mp3`).
- The frontend uses this to perform an exact match and bypass dynamic generation entirely.

### C. Audio Cleanup (`scripts/clean_audio.js`)
A utility script used to maintain a clean repository.
- It imports `audioMap.js` to determine all valid, currently referenced audio files.
- It scans `public/assets/audio/` and deletes any `.mp3` files that are no longer present in the active `audioMap`.

### D. Frontend Narration (`src/utils/narration.js`)
This module maps application phases (Intro, Wonder, Story, Simulate, Play, Reflect) to their respective audio scripts.
- Uses semantic helper functions (`say`, `ask`, `cheer`, `emphasize`, `think`, `celebrate`) to wrap text into styled narration segments.
- Ensures a **1:1 strict parity** with the on-screen text shown in UI components to prevent confusing young learners. 

### E. Frontend Audio Engine (`src/utils/audio.js`)
The core playback engine (`getAudioUrl`, `speak`, `narrate`, `preloadNarration`).
1. **Cache check:** It first checks `audioMap[text]`. If found, it immediately resolves the static asset URL.
2. **Dynamic Request:** If not found and an API key is present, it attempts to fetch the audio dynamically directly from ElevenLabs, utilizing an internal memory cache (`elevenLabsCache`).
3. **Playback:** Uses HTML5 `Audio` API (`new Audio()`).
4. **Preloading:** While playing segment `i`, it preemptively calls `getAudioUrl` for segment `i+1` so the asset is downloaded and ready exactly when the previous segment ends, guaranteeing seamless narration.

---

## 3. Workflow: Updating or Adding Narration

To update the script or add a new spoken line, follow these steps strictly to maintain synchronization:

1. **Update `generate_audio.js`:**
   Add your new exact text and its intended style to the `phrases` array inside `scripts/generate_audio.js`.
   ```javascript
   { text: "Here is my new pedagogical line!", style: 'statement' },
   ```

2. **Generate the audio:**
   Run the generation script. This will hit the ElevenLabs API, save the new `.mp3`, and update `audioMap.js`.
   ```bash
   node scripts/generate_audio.js
   ```

3. **Clean up old audio (Optional but recommended):**
   Run the cleanup script to remove orphaned files if you deleted or modified text.
   ```bash
   node scripts/clean_audio.js
   ```

4. **Update `narration.js`:**
   Implement the exact same text string into the relevant phase in `src/utils/narration.js` using the matching helper function.
   ```javascript
   export function myNewPhaseNarration() {
     return [
       say("Here is my new pedagogical line!")
     ];
   }
   ```
   *Note: Ensure the text passed to `say()` perfectly matches the text in your UI components to maintain 1:1 synchronization.*
