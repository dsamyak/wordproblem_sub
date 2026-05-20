import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

const STORY_SLIDES = [
  {
    visual: <div style={{fontSize: '5rem', display: 'flex', gap: '10px'}}>🍢🍢🍢🍢🍢🍢🍢🍢🍢</div>,
    title: 'At the Hawker Centre',
    text: 'Wei Ming is at the hawker centre. He has 9 fishballs!',
    highlight: 'Yummy fishballs!',
    mascotText: 'He has 9 fishballs! 😋',
  },
  {
    visual: <div style={{fontSize: '5rem', display: 'flex', gap: '10px'}}>🍢🍢🍢🍢🍢<span style={{opacity: 0.2}}>🍢🍢🍢🍢</span></div>,
    title: 'Taking Away!',
    text: 'He eats 4 fishballs. Yum, yum, yum!',
    highlight: 'Crunch, crunch!',
    mascotText: 'Subtract means take away! ➖',
  },
  {
    visual: <div style={{fontSize: '6rem'}}>🤔</div>,
    title: 'The Question',
    text: 'How many fishballs does Wei Ming have left?',
    highlight: '"How many are left?"',
    mascotText: "Let's find out! 🔍",
  },
  {
    visual: (
      <svg viewBox="0 0 220 160" style={{ width: '100%', height: '100%', padding: '20px' }}>
        <circle cx="110" cy="32" r="28" fill="#4A90D9" />
        <text x="110" y="40" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">9</text>
        <line x1="82" y1="60" x2="62" y2="95" stroke="#4A90D9" strokeWidth="4" />
        <line x1="138" y1="60" x2="158" y2="95" stroke="#4A90D9" strokeWidth="4" />
        <circle cx="50" cy="118" r="24" fill="#FF8A50" />
        <text x="50" y="126" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">4</text>
        <circle cx="170" cy="118" r="24" fill="#FFF9C4" stroke="#FFB300" strokeWidth="2" strokeDasharray="6,3" />
        <text x="170" y="126" fill="#FFB300" fontSize="24" textAnchor="middle" fontWeight="bold">?</text>
      </svg>
    ),
    title: 'The Number Bond',
    text: 'What do we know? The whole is 9. One part is 4.',
    highlight: 'Whole and Parts!',
    mascotText: 'We know the whole! 🧩',
  },
  {
    visual: (
      <svg viewBox="0 0 220 160" style={{ width: '100%', height: '100%', padding: '20px' }}>
        <circle cx="110" cy="32" r="28" fill="#4A90D9" />
        <text x="110" y="40" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">9</text>
        <line x1="82" y1="60" x2="62" y2="95" stroke="#4A90D9" strokeWidth="4" />
        <line x1="138" y1="60" x2="158" y2="95" stroke="#4A90D9" strokeWidth="4" />
        <circle cx="50" cy="118" r="24" fill="#FF8A50" />
        <text x="50" y="126" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">4</text>
        <circle cx="170" cy="118" r="24" fill="#FF8A50" />
        <text x="170" y="126" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">5</text>
      </svg>
    ),
    title: 'Finding the Missing Part',
    text: 'We need to find the other part. This is what is left!',
    highlight: '9 – 4 = 5',
    mascotText: 'The missing part is 5! 💡',
  },
  {
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <svg viewBox="0 0 300 80" style={{ width: '100%', height: '120px' }}>
          <rect x="20" y="10" width="260" height="30" fill="#4A90D9" rx="4" />
          <text x="150" y="32" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">Whole = 9</text>
          <rect x="20" y="45" width="115" height="30" fill="#FF8A50" rx="4" />
          <text x="77.5" y="66" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">4</text>
          <rect x="140" y="45" width="140" height="30" fill="#FF8A50" rx="4" />
          <text x="210" y="66" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">5</text>
        </svg>
      </div>
    ),
    title: 'The Bar Model',
    text: 'Draw the number bond. Put 9 at the top. Put 4 in one circle. Now write the number sentence. 9 minus 4 equals 5.',
    highlight: 'Number bonds help us solve!',
    mascotText: 'Bar models are cool! 📊',
  },
  {
    visual: <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#4A90D9', padding: '20px', textAlign: 'center'}}>Wei Ming has 5 fishballs left.</div>,
    title: 'The Answer',
    text: 'Wei Ming has 5 fishballs left!',
    highlight: 'You solved it!',
    mascotText: 'Great job! 🎉',
  },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide] = useState(0);
  const [anim, setAnim] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis] = useState(false);
  const narrationRef = useRef(null);
  const s = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct = ((slide + 1) / STORY_SLIDES.length) * 100;

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(getStoryNarration(slide));
      if (slide + 1 < STORY_SLIDES.length) {
        preloadNarration(getStoryNarration(slide + 1));
      }
    }
  }, [slide, audioEnabled]);

  useEffect(() => {
    setTextVis(false); setHlVis(false);
    const t1 = setTimeout(() => setTextVis(true), 100);
    const t2 = setTimeout(() => setHlVis(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slide]);

  useEffect(() => {
    if (textVis && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(getStoryNarration(slide), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [textVis, slide, audioEnabled]);

  const goNext = useCallback(() => {
    if (anim) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { isLast ? onComplete() : setSlide(i => i + 1); setAnim(false); }, 400);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { setSlide(i => i - 1); setAnim(false); }, 400);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      <div className="story-progress">
        <div className="story-progress-bar"><div className="story-progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>
      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        <div className="story-image-section" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3f2fd', minHeight: '200px'}}>
          {s.visual}
        </div>
        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>
          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>
          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span><span className="story-highlight-text">{s.highlight}</span><span>✨</span>
          </div>
          <div className="story-mascot">
            <div className="mascot" style={{ width: 50, height: 50, fontSize: '1.4rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.8rem', padding: '8px 14px', maxWidth: 180 }}>{s.mascotText}</div>
          </div>
        </div>
      </div>
      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev} disabled={slide === 0} style={{ opacity: slide === 0 ? 0.3 : 1 }}>← Back</button>
        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (<div key={i} className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`} />))}
        </div>
        <button className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`} onClick={goNext}>
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
