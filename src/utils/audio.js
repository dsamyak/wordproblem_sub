// ──────────────────────────────────────────────────
// Enhanced Audio Narration Engine
// Natural, teacher-like speech for young learners
// ──────────────────────────────────────────────────


let currentQueue = null;   // active narration queue id
let isSpeaking = false;
let currentAudio = null;   // Active HTMLAudioElement for ElevenLabs
let playId = 0;            // Counter to prevent delayed playback
const elevenLabsCache = new Map(); // Cache generated audio URLs

// New voice ID specified by user (Alice - Clear, Engaging Educator)
const ELEVENLABS_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

let audioMap = {};
try {
  // Import the generated map if it exists
  import('./audioMap.js').then(module => {
    audioMap = module.audioMap || {};
  }).catch(() => {
    // Ignore if not present yet
  });
} catch (e) { }



// ─── Speech Types (vary pitch/rate for natural delivery) ──
// Optimized for young learners (6-8 years old)
// Higher pitch = More engaging for children
// Slower rates = Better comprehension and emphasis
const SPEECH_STYLES = {
  // Normal teaching voice - warm and conversational
  statement: { rate: 0.85, pitch: 1.18, volume: 0.95 },

  // Questions — higher pitch, slower for emphasis, encourages engagement
  question: { rate: 0.78, pitch: 1.32, volume: 0.98 },

  // Encouragement — warm, upbeat, excited to support learning
  encouragement: { rate: 0.90, pitch: 1.35, volume: 1.0 },

  // Emphasis on key numbers/words — slower, clearer, friendly
  emphasis: { rate: 0.72, pitch: 1.25, volume: 0.98 },

  // Thinking prompt — gentle, inviting, curious
  thinking: { rate: 0.80, pitch: 1.15, volume: 0.92 },

  // Celebration — excited, faster, joyful
  celebration: { rate: 0.98, pitch: 1.42, volume: 1.0 },

  // Gentle instruction — clear and encouraging
  instruction: { rate: 0.82, pitch: 1.20, volume: 0.95 },
};


// Map our pedagogical styles to ElevenLabs emotional settings
const getElevenLabsSettings = (speechStyle) => {
  // MAXIMUM HUMANIZATION (optimized for eleven_multilingual_v2):
  // - Lower stability (~0.20-0.30): Allows natural breathing, vocal fry, and emotive inflection
  // - Lower similarity_boost (~0.50-0.65): Removes all robotic artifacts and rigidity
  // - Moderate style (~0.30-0.50): Adds warmth without breaking the voice
  switch (speechStyle) {
    case 'celebration':
      return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':
      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':
      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default: // statement, instruction
      return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

export async function getAudioUrl(text, style) {
  // 1. Check if we have a pre-generated static audio file for this exact text
  if (audioMap && audioMap[text]) {
    // Return the static asset URL
    return audioMap[text];
  }

  const cacheKey = `${text}_${style}`;

  if (elevenLabsCache.has(cacheKey)) {
    return elevenLabsCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    const localApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const voiceSettings = getElevenLabsSettings(style);

    let response = await fetch(`/api/elevenlabs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID, voiceSettings })
    });

    const isHtmlFallback = (response.headers.get('content-type') || '').includes('text/html');

    if ((!response.ok || isHtmlFallback) && localApiKey) {
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': localApiKey },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: voiceSettings })
      });
    }

    if (!response.ok || isHtmlFallback) {
      throw new Error("Failed to fetch audio from both secure backend and direct fallback.");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  })();

  // Cache the promise so concurrent requests for the same text don't trigger multiple network calls
  elevenLabsCache.set(cacheKey, fetchPromise);

  // If it fails, remove it from the cache so we can try again later
  fetchPromise.catch(() => elevenLabsCache.delete(cacheKey));

  return fetchPromise;
}

// ─── Core: speak a single text ──────────────────
export function speak(text, enabled = true, style = 'statement') {
  return new Promise(async (resolve) => {
    if (!enabled || !text) {
      resolve();
      return;
    }

    playId++;
    const currentPlayId = playId;
    window.speechSynthesis?.cancel(); // Cancel any fallback speech
    isSpeaking = true;

    try {
      const audioUrl = await getAudioUrl(text, style);

      // Check if playback was cancelled while fetching
      if (currentPlayId !== playId) {
        isSpeaking = false;
        resolve();
        return;
      }

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      currentAudio = new Audio(audioUrl);
      currentAudio.onended = () => {
        isSpeaking = false;
        resolve();
      };
      currentAudio.onerror = () => {
        isSpeaking = false;
        resolve();
      };

      await currentAudio.play();
      return; // Success, skip fallback

    } catch (error) {
      console.error("ElevenLabs failed, and fallback is disabled:", error);
      isSpeaking = false;
      resolve();
    }
  });
}



// ─── Narration Segment Types ────────────────────
// Each segment is an object: { text, style, pause }
//   text:  string to speak
//   style: one of SPEECH_STYLES keys
//   pause: ms to wait AFTER this segment (thinking pause, etc.)

/**
 * Build a narration segment.
 * @param {string} text - What to say
 * @param {string} style - Speech style key
 * @param {number} pause - Pause in ms after speaking (default 400)
 */
export function seg(text, style = 'statement', pause = 400) {
  return { text, style, pause };
}

// Shorthand helpers for common segment types (reduced pauses for faster flow)
export const say = (text, pause = 0) => seg(text, 'statement', pause);
export const ask = (text, pause = 0) => seg(text, 'question', pause);
export const cheer = (text, pause = 0) => seg(text, 'encouragement', pause);
export const emphasize = (text, pause = 0) => seg(text, 'emphasis', pause);
export const think = (text, pause = 0) => seg(text, 'thinking', pause);
export const celebrate = (text, pause = 0) => seg(text, 'celebration', pause);
export const instruct = (text, pause = 0) => seg(text, 'instruction', pause);
export const pause = (ms = 0) => seg('', 'statement', ms); // silent pause

/**
 * Preload all audio for a sequence of segments so there is zero latency when playing.
 */
export function preloadNarration(segments) {
  if (!segments) return;
  segments.forEach(seg => {
    if (seg.text && seg.text.trim()) {
      getAudioUrl(seg.text, seg.style).catch(() => { });
    }
  });
}

// ─── Narrate: play a sequence of segments ───────
/**
 * Speak a sequence of narration segments with natural pauses.
 * Returns a cancel function. Calling it stops the narration mid-way.
 *
 * @param {Array} segments - Array of segment objects from seg()/say()/ask()/etc.
 * @param {boolean} enabled - Whether audio is enabled
 * @returns {{ cancel: Function, promise: Promise }}
 */
export function narrate(segments, enabled = true) {
  const queueId = Symbol('narration');
  currentQueue = queueId;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (currentQueue === queueId) {
      window.speechSynthesis?.cancel();
      isSpeaking = false;
      currentQueue = null;
    }
  };

  const promise = (async () => {
    if (!enabled || !segments || segments.length === 0) return;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (cancelled || currentQueue !== queueId) return;

      // PRELOAD the next segment in the background to eliminate loading latency!
      if (i + 1 < segments.length) {
        const nextSeg = segments[i + 1];
        if (nextSeg.text && nextSeg.text.trim()) {
          // Fire and forget preload (the promise is cached)
          getAudioUrl(nextSeg.text, nextSeg.style).catch(console.error);
        }
      }

      // Speak the text (skip if empty — used for silent pauses)
      if (segment.text && segment.text.trim()) {
        await speak(segment.text, true, segment.style);
      }

      // Wait the pause duration
      if (segment.pause > 0 && !cancelled && currentQueue === queueId) {
        await new Promise(r => setTimeout(r, segment.pause));
      }
    }
  })();

  return { cancel, promise };
}


// ─── Stop all narration ─────────────────────────
export function stopNarration() {
  playId++; // Invalidate any pending ElevenLabs fetches
  currentQueue = null;
  window.speechSynthesis?.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isSpeaking = false;
}


// ─── Simple tone generation using AudioContext ──
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playTone(frequency, duration = 200) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) { /* silent fallback */ }
}

export const sounds = {
  correct: () => { playTone(523, 150); setTimeout(() => playTone(659, 150), 150); setTimeout(() => playTone(784, 200), 300); },
  wrong: () => { playTone(220, 300); },
  badge: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 200), i * 150)); },
  click: () => playTone(440, 80),
  streak: () => { playTone(880, 100); setTimeout(() => playTone(1100, 150), 100); },
  frogHop: () => playTone(660, 100),
};
