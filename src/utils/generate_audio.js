import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
const voiceId = '8N2ng9i2uiUWqstgmWlH';
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
    { text: "Number Bonds For Subtraction", style: 'encouragement' },
    { text: "Lesson 3.2. Subtract within 20 using number bonds", style: 'statement' },
    { text: "Let's crack the number bonds!", style: 'encouragement' },
    { text: "Learn to use number bonds to take away numbers, find the missing part, and solve subtraction challenges!", style: 'statement' },
    { text: "Your Learning Journey. Wonder. A subtraction mystery! Story. See subtraction in action. Simulate. Build number bonds. Play. Gamified challenges. Reflect. What did you learn?", style: 'statement' },
    { text: "Let's Discover!", style: 'celebration' },
    { text: "Hmm... I wonder...", style: 'thinking' },
    { text: "Wei Ming's Stickers", style: 'statement' },
    { text: "Wei Ming has 8 shiny stickers. He wants to share them with his friend Priya, so he gives 3 stickers to her. Wei Ming wonders...", style: 'statement' },
    { text: "How many stickers do I have left?", style: 'question' },
    { text: "Let's help Wei Ming!", style: 'encouragement' },
    { text: "Taking Away!", style: 'statement' },
    { text: "To find out, we take away the 3 stickers he gave to Priya. Taking away is called subtraction. When we subtract, the number gets smaller!", style: 'statement' },
    { text: "8 take away 3 leaves 5!", style: 'emphasis' },
    { text: "Subtract means take away!", style: 'statement' },
    { text: "The Number Bond Secret", style: 'statement' },
    { text: "Wei Ming drew a special picture called a number bond. He put the whole 8 at the top. Then he made two branches for the parts: 3 for Priya, and 5 for him. \"The whole minus a part equals the other part!\" he said.", style: 'statement' },
    { text: "Whole minus Part equals Part!", style: 'emphasis' },
    { text: "Crack the number bond!", style: 'encouragement' },
    { text: "Let's Solve Together!", style: 'statement' },
    { text: "Wei Ming was so excited! He learned he could use number bonds to solve subtraction word problems easily. \"Can we practice more?\" he asked.", style: 'statement' },
    { text: "Number bonds — here we come!", style: 'encouragement' },
    { text: "Your turn now!", style: 'encouragement' },
    { text: "Counter Take-Away", style: 'statement' },
    { text: "Number Bond Builder", style: 'statement' },
    { text: "Find the missing number to complete the bond!", style: 'statement' },
    { text: "Number Sentence", style: 'statement' },
    { text: "Fill in the blank! Use the number pad.", style: 'statement' },
    { text: "Reflect. What did you learn?", style: 'statement' },
    { text: "How confident do you feel about subtraction using number bonds?", style: 'question' },
    { text: "Certificate of Achievement!", style: 'statement' },
    { text: "If I have 9 cookies and eat 4... what's left?", style: 'question' },
    { text: "What if there's a magic way to find the missing part?", style: 'question' },
    { text: "If there are 12 birds and 5 fly away, how many stay?", style: 'question' },
    { text: "Taking away is like a puzzle — we just need to find the missing piece!", style: 'statement' },
    { text: "How can a number bond help us when we take things away?", style: 'question' },
    { text: "Number bonds are like secret maps for numbers!", style: 'statement' },
    { text: "If we know the whole and one part, can we find the other part?", style: 'question' },
    { text: "Subtraction is just finding the missing part of the team!", style: 'statement' },
    { text: "What happens when we take a big number and break it into two smaller parts?", style: 'question' },
    { text: "That's exactly what a number bond does!", style: 'statement' },
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
