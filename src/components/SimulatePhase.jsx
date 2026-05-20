import React, { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { say, ask, cheer, celebrate, instruct, think } from '../utils/audio';
import NumberBondDiagram from './NumberBondDiagram';
import { simulateStation1Intro, simulateStation2Intro, simulateStation3Intro, simulateAllComplete } from '../utils/narration';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const STATIONS = [
  { id: 0, title: 'Take Away', subtitle: 'Concrete Counters', icon: '🍪' },
  { id: 1, title: 'Number Bond', subtitle: 'Pictorial Builder', icon: '🧩' },
  { id: 2, title: 'Number Sentence', subtitle: 'Abstract Math', icon: '📝' },
];

// ═══════════════════════════════════════════════════
// STATION 1: Counter Take-Away (Concrete)
// ═══════════════════════════════════════════════════
function Station1({ audioEnabled, onNext }) {
  const [whole, setWhole] = useState(0);
  const [targetTakeAway, setTargetTakeAway] = useState(0);
  const [removed, setRemoved] = useState(0);
  const [round, setRound] = useState(0);
  const narRef = useRef(null);

  useEffect(() => {
    const w = randInt(5, 10);
    const ta = randInt(1, w - 1);
    setWhole(w);
    setTargetTakeAway(ta);
    setRemoved(0);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && whole > 0) {
      narRef.current = narrate(simulateStation1Intro(whole, targetTakeAway), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [whole, targetTakeAway, audioEnabled]);

  const handleCrossOut = (idx) => {
    if (idx < removed) return; // already crossed out
    if (idx !== removed) return; // Must cross out sequentially
    if (removed >= targetTakeAway) return;

    sounds.click();
    setRemoved(r => r + 1);

    if (removed + 1 === targetTakeAway) {
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
        narRef.current = narrate([
          celebrate(`${whole} take away ${targetTakeAway} leaves ${whole - targetTakeAway}!`),
          cheer("Great job taking them away!")
        ], true);
      }
    }
  };

  const done = removed === targetTakeAway;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🍪 Counter Take-Away</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        <strong>Story:</strong> Wei Ming has <strong style={{ color: 'var(--gold)' }}>{whole}</strong> cookies. He eats <strong style={{ color: 'var(--coral)' }}>{targetTakeAway}</strong> of them.
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
        Tap {targetTakeAway} cookies to take them away.
      </p>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {Array.from({ length: whole }, (_, i) => (
          <div key={i} 
               onClick={() => handleCrossOut(i)}
               style={{ 
                 fontSize: '2.5rem', cursor: (i === removed && !done) ? 'pointer' : 'default',
                 opacity: i < removed ? 0.3 : 1,
                 transform: i < removed ? 'scale(0.8)' : 'scale(1)',
                 transition: 'all 0.3s',
                 position: 'relative'
               }}>
            🍪
            {i < removed && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'red', fontSize: '3rem', fontWeight: 'bold' }}>X</div>}
          </div>
        ))}
      </div>

      {/* Number Bond */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <NumberBondDiagram whole={whole} part1={removed} part2={whole - removed} missing="none" animated={true} />
      </div>

      {done && (
        <div style={{ animation: 'bounceIn 0.5s' }}>
          <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: 12 }}>
            {whole} – {targetTakeAway} = {whole - targetTakeAway} 🎉
          </div>
          <button className={`btn ${round < 2 ? 'btn-outline' : 'btn-primary'}`} onClick={() => setRound(r => r + 1)}>
            {round < 2 ? 'Try Another →' : 'Next Station →'}
          </button>
        </div>
      )}
      
      {round >= 3 && onNext()}

      <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 2: Number Bond Builder (Pictorial)
// ═══════════════════════════════════════════════════
function Station2({ audioEnabled, onNext }) {
  const [whole, setWhole] = useState(0);
  const [part1, setPart1] = useState(0);
  const [part2, setPart2] = useState(0);
  const [missingSlot, setMissingSlot] = useState('part2');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [round, setRound] = useState(0);
  const narRef = useRef(null);

  useEffect(() => {
    const w = randInt(5, 15);
    const p1 = randInt(1, w - 1);
    setWhole(w);
    setPart1(p1);
    setPart2(w - p1);
    setMissingSlot(Math.random() > 0.5 ? 'part2' : 'whole');
    setSelectedAnswer(null);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && whole > 0) {
      narRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [whole, audioEnabled]);

  const missingValue = missingSlot === 'whole' ? whole : part2;
  const distractors = [missingValue, missingValue + 1, missingValue - 1, missingValue + 2].filter(x => x > 0).slice(0, 3).sort(() => Math.random() - 0.5);

  const handleSelect = (val) => {
    if (selectedAnswer !== null) return;
    if (val === missingValue) {
      sounds.correct();
      setSelectedAnswer(val);
      narRef.current?.cancel();
      if (audioEnabled) {
         narRef.current = narrate([celebrate(`Correct! ${part1} and ${part2} make ${whole}!`)], true);
      }
    } else {
      sounds.wrong();
    }
  };

  const done = selectedAnswer !== null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🧩 Number Bond Builder</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Find the missing number to complete the bond!
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <NumberBondDiagram 
          whole={selectedAnswer !== null && missingSlot === 'whole' ? whole : (missingSlot === 'whole' ? '?' : whole)} 
          part1={part1} 
          part2={selectedAnswer !== null && missingSlot === 'part2' ? part2 : (missingSlot === 'part2' ? '?' : part2)} 
          missing={selectedAnswer === null ? missingSlot : 'none'} 
          animated={true} 
        />
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {distractors.map((val, i) => (
          <button key={i} className="btn btn-outline" onClick={() => handleSelect(val)} disabled={done}
            style={{ fontSize: '1.5rem', width: 60, height: 60, borderRadius: '50%' }}>
            {val}
          </button>
        ))}
      </div>

      {done && (
        <div style={{ marginTop: 24, animation: 'bounceIn 0.5s' }}>
          <button className={`btn ${round < 2 ? 'btn-outline' : 'btn-primary'}`} onClick={() => setRound(r => r + 1)}>
            {round < 2 ? 'Try Another →' : 'Next Station →'}
          </button>
        </div>
      )}

      {round >= 3 && onNext()}

      <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 3: Number Sentence (Abstract)
// ═══════════════════════════════════════════════════
function Station3({ audioEnabled, onComplete }) {
  const [whole, setWhole] = useState(0);
  const [part1, setPart1] = useState(0);
  const [part2, setPart2] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [round, setRound] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  useEffect(() => {
    const w = randInt(6, 20);
    const p1 = randInt(1, w - 1);
    setWhole(w);
    setPart1(p1);
    setPart2(w - p1);
    setInputVal('');
    setShowHint(false);
    setDone(false);
  }, [round]);

  useEffect(() => {
    if (audioEnabled && whole > 0) {
      narRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [whole, audioEnabled]);

  const handleNumClick = (n) => {
    if (done) return;
    const newVal = inputVal + n;
    setInputVal(newVal);
    sounds.click();

    if (parseInt(newVal) === part2) {
      setDone(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) {
         narRef.current = narrate([celebrate(`Yes! ${whole} take away ${part1} equals ${part2}!`)], true);
      }
    } else if (newVal.length >= String(part2).length) {
      sounds.wrong();
      setTimeout(() => setInputVal(''), 500);
    }
  };

  const handleComplete = () => { narRef.current?.cancel(); stopNarration(); onComplete(); };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>📝 Number Sentence</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Fill in the blank! Use the number pad.
      </p>

      <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <span>{whole}</span>
        <span style={{ color: 'var(--coral)' }}>–</span>
        <span>{part1}</span>
        <span style={{ color: 'var(--gold)' }}>=</span>
        <div style={{ width: 60, height: 60, border: `3px ${done ? 'solid var(--green)' : 'dashed var(--gold)'}`, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', background: done ? 'rgba(76,175,80,0.2)' : 'transparent' }}>
          {inputVal || (done ? part2 : '?')}
        </div>
      </div>

      <button className="btn btn-sm btn-outline" onClick={() => setShowHint(!showHint)} style={{ marginBottom: 24 }}>
        {showHint ? 'Hide Hint' : 'Show Hint 🔢'}
      </button>

      {showHint && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, animation: 'slideUp 0.3s' }}>
           <NumberBondDiagram whole={whole} part1={part1} part2="?" missing="part2" />
        </div>
      )}

      {/* Number Pad */}
      {!done && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 200, margin: '0 auto' }}>
          {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button key={n} className="btn btn-outline" onClick={() => handleNumClick(n)} style={{ fontSize: '1.2rem', padding: '12px 0' }}>
              {n}
            </button>
          ))}
          <button className="btn btn-outline" onClick={() => setInputVal('')} style={{ gridColumn: 'span 2' }}>Clear</button>
        </div>
      )}

      {done && (
        <div style={{ marginTop: 24, animation: 'bounceIn 0.5s' }}>
          {round < 2 ? (
            <button className="btn btn-outline" onClick={() => setRound(r => r + 1)}>Try Another →</button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleComplete}>🎉 Complete Simulation!</button>
          )}
        </div>
      )}

      {round >= 3 && !done && handleComplete()}

      <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round {Math.min(round + 1, 3)} / 3</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main SimulatePhase
// ═══════════════════════════════════════════════════
export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const nextStation = useCallback(() => { if (station < 2) setStation(s => s + 1); }, [station]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h3 className="simulate-label">🧪 Simulate</h3>
        <p className="simulate-sublabel">Explore and discover — no wrong answers!</p>
      </div>
      <div className="progress-dots">
        {STATIONS.map((s, i) => (
          <div key={i} className="simulate-dot-wrapper">
            <div className={`progress-dot ${i === station ? 'active' : i < station ? 'completed' : ''}`} />
            <span className="simulate-dot-label">{s.icon}</span>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ maxWidth: 800, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {station === 0 && <Station1 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 1 && <Station2 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 2 && <Station3 audioEnabled={audioEnabled} onComplete={onComplete} />}
      </div>
    </div>
  );
}
