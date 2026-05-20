import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
const voiceId = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const audioDir = path.join(__dirname, '../public/assets/audio');

if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Map styles to elevenlabs settings
const getElevenLabsSettings = (style) => {
    switch (style) {
        case 'celebration': return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
        case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
        case 'question': return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
        case 'emphasis': return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
        case 'thinking': return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
        default: return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
    }
};

const phrases = [
    { text: "Welcome to Word Problems Using Subtraction!", style: 'statement' },
    { text: "In this lesson, you will learn how to solve subtraction word problems.", style: 'statement' },
    { text: "Let's start our adventure!", style: 'encouragement' },
    { text: "Siti had 10 balloons at her party. Some flew away! Now she has 6. How many flew away?", style: 'question' },
    { text: "Hmm... I wonder how we can find out?", style: 'thinking' },
    { text: "Let's learn how to solve it together!", style: 'encouragement' },
    { text: "Wei Ming is at the hawker centre. He has 9 fishballs!", style: 'statement' },
    { text: "He eats 4 fishballs. Yum, yum, yum!", style: 'statement' },
    { text: "How many fishballs does Wei Ming have left?", style: 'question' },
    { text: "What do we know? The whole is 9. One part is 4.", style: 'emphasis' },
    { text: "We need to find the other part. This is what is left!", style: 'thinking' },
    { text: "Draw the number bond. Put 9 at the top. Put 4 in one circle.", style: 'instruction' },
    { text: "Now write the number sentence. 9 minus 4 equals 5.", style: 'emphasis' },
    { text: "Wei Ming has 5 fishballs left!", style: 'celebration' },
    { text: "Station One! Read the story. Now place the counters.", style: 'statement' },
    { text: "Great! Now take away the right number of counters.", style: 'instruction' },
    { text: "How many are left?", style: 'question' },
    { text: "Station Two! Look at the number bond.", style: 'statement' },
    { text: "Drag the numbers into the correct circles.", style: 'statement' },
    { text: "The whole goes at the top. The parts go at the bottom.", style: 'statement' },
    { text: "Station Three! Write the subtraction sentence.", style: 'statement' },
    { text: "Tap each box and type the number.", style: 'statement' },
    { text: "Then complete the answer sentence.", style: 'statement' },
    { text: "Amazing! You solved the word problem!", style: 'celebration' },
    { text: "Brilliant! You used the number bond perfectly!", style: 'celebration' },
    { text: "You're a maths superstar! Keep going!", style: 'celebration' },
    { text: "Wonderful! That's exactly right!", style: 'encouragement' },
    { text: "Let's try again! Read the problem carefully.", style: 'thinking' },
    { text: "Almost there! Think about what we need to find.", style: 'thinking' },
    { text: "Hmm... look at the number bond. It will help you!", style: 'thinking' },
    { text: "Wonderful! You are a Word Problem Champion!", style: 'celebration' },
    { text: "Tell me one thing you learned today!", style: 'question' },
    { text: "Can you make up your own subtraction word problem?", style: 'question' },
    { text: "You earned the Problem Spotter badge! You know how to find the question!", style: 'celebration' },
    { text: "Model Builder badge unlocked! You can draw number bonds like a pro!", style: 'celebration' },
    { text: "Word Problem Whiz! You are amazing at solving word problems!", style: 'celebration' },
    { text: "Perfect Story badge! Ten out of ten! You are a superstar!", style: 'celebration' },
    { text: "Streak Legend! Ten in a row! You are on fire!", style: 'celebration' },
    { text: "Full Champion! You finished the whole lesson! You are a Word Problem Champion!", style: 'celebration' },
    { text: "Singapore Solver! You explored every world! Amazing work!", style: 'celebration' },
    { text: "Bond and Story Link badge! You solved it all by yourself! Brilliant!", style: 'celebration' },
];

async function generate() {
    const mapData = {};

    for (let i = 0; i < phrases.length; i++) {
        const { text, style } = phrases[i];
        const safeName = text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
        const filename = `audio_${safeName}_${i}.mp3`;
        const filepath = path.join(audioDir, filename);

        mapData[text] = `/assets/audio/${filename}`;

        if (fs.existsSync(filepath)) {
            console.log(`Skipping (already exists): ${filename}`);
            continue;
        }

        console.log(`Generating: ${filename}`);

        const settings = getElevenLabsSettings(style);

        try {
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: settings
                })
            });

            if (!res.ok) {
                console.error(`Failed to generate ${filename}: ${res.statusText}`);
                const textErr = await res.text();
                console.error(textErr);
                continue;
            }

            const buffer = await res.arrayBuffer();
            fs.writeFileSync(filepath, Buffer.from(buffer));
            console.log(`Saved: ${filename}`);
        } catch (err) {
            console.error(`Error with ${filename}:`, err.message);
        }

        // small delay to prevent rate limit
        await new Promise(r => setTimeout(r, 500));
    }

    const mapFile = path.join(__dirname, '../src/utils/audioMap.js');
    fs.writeFileSync(mapFile, `export const audioMap = ${JSON.stringify(mapData, null, 2)};\n`);
    console.log('Done generating! Map saved to src/utils/audioMap.js');
}

generate();
