import React, { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { celebrate, cheer, say, instruct } from '../utils/audio';
import NumberBondDiagram from './NumberBondDiagram';
import { simulateStation1Intro, simulateStation2Intro, simulateStation3Intro, simulateAllComplete } from '../utils/narration';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const STORIES = [
  { name: 'Wei Ming', obj: 'fishballs', emoji: '🍢', verb: 'ate' },
  { name: 'Siti', obj: 'balloons', emoji: '🎈', verb: 'gave away' },
  { name: 'Priya', obj: 'stickers', emoji: '🏷️', verb: 'gave away' },
  { name: 'Raju', obj: 'marbles', emoji: '🔮', verb: 'lost' },
  { name: 'Ahmad', obj: 'biscuits', emoji: '🍪', verb: 'ate' },
];

const STATIONS = [
  { id: 0, title: 'Read & Show', subtitle: 'Place and take away counters', icon: '🎯' },
  { id: 1, title: 'Draw the Bond', subtitle: 'Drag numbers into the bond', icon: '🧩' },
  { id: 2, title: 'Write the Sentence', subtitle: 'Build the maths sentence', icon: '✏️' },
];

// ═══════════════════════════════════════════════════
// STATION A: Read & Show (Interactive Counters)
// ═══════════════════════════════════════════════════
function StationA({ audioEnabled, onNext }) {
  const [story] = useState(() => pick(STORIES));
  const [whole] = useState(() => randInt(6, 10));
  const [takeAway] = useState(() => randInt(2, 4));
  const [step, setStep] = useState(0); // 0=read, 1=place, 2=remove, 3=count, 4=done
  const [placed, setPlaced] = useState([]);
  const [removed, setRemoved] = useState(new Set());
  const [shakeIdx, setShakeIdx] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const narRef = useRef(null);
  const remaining = whole - takeAway;

  useEffect(() => {
    if (audioEnabled) {
      narRef.current = narrate(simulateStation1Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [audioEnabled]);

  // Step 0 → 1: Read story, then start placing
  const handleStartPlace = () => {
    sounds.click();
    setStep(1);
  };

  // Step 1: Place counters one by one
  const handlePlace = () => {
    if (placed.length >= whole) return;
    sounds.click();
    const newPlaced = [...placed, { id: placed.length, entering: true }];
    setPlaced(newPlaced);
    // Auto-advance after all placed
    if (newPlaced.length === whole) {
      setTimeout(() => {
        sounds.correct();
        setStep(2);
      }, 600);
    }
  };

  // Step 2: Tap to remove counters
  const handleRemove = (idx) => {
    if (removed.has(idx)) return;
    if (removed.size >= takeAway) return;
    sounds.click();
    const newRemoved = new Set(removed);
    newRemoved.add(idx);
    setRemoved(newRemoved);

    // Shake animation
    setShakeIdx(idx);
    setTimeout(() => setShakeIdx(null), 500);

    if (newRemoved.size === takeAway) {
      setTimeout(() => {
        sounds.correct();
        setStep(3);
      }, 600);
    }
  };

  // Step 3: Count remaining — select answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const answerOptions = React.useMemo(() => {
    const opts = new Set([remaining]);
    while (opts.size < 4) {
      const d = remaining + (Math.random() > 0.5 ? 1 : -1) * randInt(1, 3);
      if (d >= 0 && d <= 20) opts.add(d);
    }
    return [...opts].sort(() => Math.random() - 0.5);
  }, [remaining]);

  const handleAnswer = (val) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(val);
    if (val === remaining) {
      sounds.correct();
      // Add sparkles
      setSparkles(Array.from({ length: 8 }, (_, i) => ({
        id: i, x: 30 + Math.random() * 40, y: 20 + Math.random() * 40,
        delay: Math.random() * 0.5
      })));
      if (audioEnabled) {
        narRef.current?.cancel();
        narRef.current = narrate([
          celebrate(`Yes! ${whole} take away ${takeAway} is ${remaining}!`)
        ], true);
      }
      setTimeout(() => setStep(4), 1200);
    } else {
      sounds.wrong();
      setShakeIdx('answer');
      setTimeout(() => { setShakeIdx(null); setSelectedAnswer(null); }, 600);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header">
        <h2>🎯 Station A: Read & Show</h2>
      </div>

      {/* Story Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        textAlign: 'left', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          📖 Word Problem
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
          <strong>{story.name}</strong> has <strong style={{ color: 'var(--gold)', fontSize: '1.3rem' }}>{whole}</strong> {story.obj}.
          {step >= 2 && <> {story.name === 'Siti' || story.name === 'Priya' ? 'She' : 'He'} {story.verb} <strong style={{ color: 'var(--coral)', fontSize: '1.3rem' }}>{takeAway}</strong>.</>}
          {step >= 3 && <> How many {story.obj} are left?</>}
        </p>
      </div>

      {/* Step 0: Read */}
      {step === 0 && (
        <div style={{ animation: 'slideUp 0.4s ease' }}>
          <div className="mascot-container" style={{ marginBottom: 16 }}>
            <div className="mascot" style={{ width: 60, height: 60 }}>🤖</div>
            <div className="speech-bubble">Read the story! Now place {whole} {story.emoji} on the plate.</div>
          </div>
          <button className="btn btn-primary" onClick={handleStartPlace}>
            {story.emoji} Place {whole} {story.obj}
          </button>
        </div>
      )}

      {/* Step 1: Place counters */}
      {step === 1 && (
        <div style={{ animation: 'slideUp 0.3s ease' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            Tap the button to place each {story.obj.slice(0, -1)}! ({placed.length}/{whole})
          </p>
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            minHeight: 80, padding: 16, background: 'rgba(255,255,255,0.05)',
            borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)', marginBottom: 16
          }}>
            {placed.map((p) => (
              <span key={p.id} style={{
                fontSize: '2.8rem', display: 'inline-block',
                animation: 'bounceIn 0.4s ease',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>{story.emoji}</span>
            ))}
            {placed.length < whole && (
              <span style={{ fontSize: '2.8rem', opacity: 0.2, border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 12, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {story.emoji}
              </span>
            )}
          </div>
          {placed.length < whole && (
            <button className="btn btn-primary" onClick={handlePlace} style={{ fontSize: '1.1rem' }}>
              {story.emoji} Place one more! ({placed.length + 1})
            </button>
          )}
        </div>
      )}

      {/* Step 2: Remove counters */}
      {step === 2 && (
        <div style={{ animation: 'slideUp 0.3s ease' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>
            {story.name} {story.verb} {takeAway}. Tap {takeAway} {story.obj} to take them away! ({removed.size}/{takeAway})
          </p>
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            minHeight: 80, padding: 16, background: 'rgba(255,255,255,0.05)',
            borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)', marginBottom: 16
          }}>
            {Array.from({ length: whole }, (_, i) => (
              <div key={i}
                onClick={() => handleRemove(i)}
                style={{
                  fontSize: '2.8rem', position: 'relative',
                  cursor: removed.has(i) ? 'default' : 'pointer',
                  opacity: removed.has(i) ? 0.25 : 1,
                  transform: removed.has(i) ? 'scale(0.7) rotate(10deg)' : (shakeIdx === i ? 'scale(1.2)' : 'scale(1)'),
                  transition: 'all 0.4s cubic-bezier(.68,-0.55,.27,1.55)',
                  filter: removed.has(i) ? 'grayscale(1)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  userSelect: 'none'
                }}>
                {story.emoji}
                {removed.has(i) && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-15deg)',
                    color: '#ff1744', fontSize: '3.5rem', fontWeight: 900,
                    textShadow: '0 2px 8px rgba(255,0,0,0.4)',
                    animation: 'bounceIn 0.3s'
                  }}>✕</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Count remaining */}
      {step === 3 && (
        <div style={{ animation: 'slideUp 0.3s ease' }}>
          {/* Show remaining items */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            padding: 16, background: 'rgba(255,255,255,0.05)',
            borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)', marginBottom: 16,
            position: 'relative'
          }}>
            {Array.from({ length: whole }, (_, i) => (
              <div key={i} style={{
                fontSize: '2.8rem', opacity: removed.has(i) ? 0.15 : 1,
                filter: removed.has(i) ? 'grayscale(1) blur(1px)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                position: 'relative'
              }}>
                {story.emoji}
                {removed.has(i) && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ff1744', fontSize: '3rem', fontWeight: 900 }}>✕</div>
                )}
              </div>
            ))}
            {/* Sparkles */}
            {sparkles.map(s => (
              <div key={s.id} style={{
                position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                fontSize: '1.5rem', animation: `sparkle 1s ${s.delay}s ease-out forwards`,
                pointerEvents: 'none'
              }}>✨</div>
            ))}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16 }}>
            How many {story.obj} are left? Count them!
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {answerOptions.map((val) => (
              <button key={val}
                className={`btn ${selectedAnswer === val ? (val === remaining ? 'btn-green' : 'btn-danger') : 'btn-outline'}`}
                onClick={() => handleAnswer(val)}
                disabled={selectedAnswer !== null && selectedAnswer === remaining}
                style={{
                  fontSize: '1.8rem', width: 70, height: 70, borderRadius: '50%',
                  fontWeight: 700, fontFamily: 'var(--font-display)',
                  animation: shakeIdx === 'answer' && selectedAnswer === val ? 'shake 0.4s' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <div style={{ animation: 'bounceIn 0.5s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))',
            borderRadius: 16, padding: 24, marginBottom: 16, border: '2px solid rgba(76,175,80,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--green-light)', fontWeight: 700 }}>
              {whole} – {takeAway} = {remaining}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              {story.name} has {remaining} {story.obj} left!
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onNext}>
            Next Station →
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {['Read', 'Place', 'Take Away', 'Count', 'Done'].map((label, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i === step ? 'var(--gold)' : i < step ? 'var(--green-light)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease'
          }} title={label} />
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════
// STATION B: Draw the Bond (Drag & Drop)
// ═══════════════════════════════════════════════════
function StationB({ audioEnabled, onNext }) {
  const [story] = useState(() => pick(STORIES));
  const [whole] = useState(() => randInt(6, 12));
  const [part1] = useState(() => randInt(2, whole - 2));
  const part2 = whole - part1;

  // Slots: whole, left-part, right-part
  const [slots, setSlots] = useState({ whole: null, part1: null, part2: null });
  const [draggedChip, setDraggedChip] = useState(null);
  const [step, setStep] = useState(0); // 0=intro, 1=drag, 2=done
  const [wrongSlot, setWrongSlot] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const narRef = useRef(null);

  // The chips available to drag
  const chips = React.useMemo(() => {
    const extras = new Set();
    while (extras.size < 2) {
      const e = randInt(1, 20);
      if (e !== whole && e !== part1 && e !== part2) extras.add(e);
    }
    return [whole, part1, part2, ...extras].sort(() => Math.random() - 0.5);
  }, [whole, part1, part2]);

  const usedChips = new Set([slots.whole, slots.part1, slots.part2].filter(v => v !== null));

  useEffect(() => {
    if (audioEnabled) {
      narRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [audioEnabled]);

  // Check if the bond is complete
  const isComplete = slots.whole === whole && slots.part1 === part1 && slots.part2 === part2;

  useEffect(() => {
    if (isComplete && step !== 2) {
      sounds.correct();
      setSparkles(Array.from({ length: 12 }, (_, i) => ({
        id: i, x: 20 + Math.random() * 60, y: 10 + Math.random() * 60,
        delay: Math.random() * 0.5
      })));
      if (audioEnabled) {
        narRef.current?.cancel();
        narRef.current = narrate([celebrate(`Perfect! ${part1} and ${part2} make ${whole}!`)], true);
      }
      setTimeout(() => setStep(2), 800);
    }
  }, [isComplete, step, audioEnabled, whole, part1, part2]);

  const handleChipClick = (val) => {
    if (step === 2) return;
    if (usedChips.has(val)) return;
    if (step === 0) setStep(1);
    setDraggedChip(draggedChip === val ? null : val);
  };

  const handleSlotClick = (slotName) => {
    if (step === 2 || draggedChip === null) return;
    if (slots[slotName] !== null) return; // Slot already filled

    // Validate
    const expected = slotName === 'whole' ? whole : slotName === 'part1' ? part1 : part2;
    if (draggedChip === expected) {
      sounds.click();
      setSlots(prev => ({ ...prev, [slotName]: draggedChip }));
      setDraggedChip(null);
    } else {
      sounds.wrong();
      setWrongSlot(slotName);
      setTimeout(() => setWrongSlot(null), 600);
    }
  };

  const handleRemoveFromSlot = (slotName) => {
    if (step === 2) return;
    if (slots[slotName] === null) return;
    sounds.click();
    setSlots(prev => ({ ...prev, [slotName]: null }));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🧩 Station B: Draw the Bond</h2></div>

      {/* Story context */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '12px 20px', marginBottom: 20, textAlign: 'left'
      }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
          <strong>{story.name}</strong> had <strong style={{ color: 'var(--gold)' }}>{whole}</strong> {story.obj}.
          {' '}{story.name === 'Siti' || story.name === 'Priya' ? 'She' : 'He'} {story.verb}{' '}
          <strong style={{ color: 'var(--coral)' }}>{part1}</strong>.
          How many are left?
        </p>
      </div>

      {/* Instruction */}
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        {step === 0 ? 'Tap a number chip, then tap the correct circle!' : 
         step === 2 ? '🎉 Perfect bond!' : 
         draggedChip !== null ? `Now tap the circle where ${draggedChip} goes ↓` : 'Tap a number chip below ↓'}
      </p>

      {/* Interactive Bond SVG */}
      <div style={{ position: 'relative', maxWidth: 300, margin: '0 auto 24px', minHeight: 200 }}>
        <svg viewBox="0 0 300 200" style={{ width: '100%' }}>
          {/* Lines */}
          <line x1="150" y1="65" x2="80" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <line x1="150" y1="65" x2="220" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />

          {/* Whole circle (top) */}
          <g onClick={() => handleSlotClick('whole')} style={{ cursor: slots.whole === null && draggedChip !== null ? 'pointer' : 'default' }}>
            <circle cx="150" cy="42" r="35"
              fill={slots.whole !== null ? '#4A90D9' : 'rgba(255,255,255,0.08)'}
              stroke={wrongSlot === 'whole' ? '#ff1744' : (slots.whole !== null ? '#2E6DB4' : 'rgba(255,255,255,0.3)')}
              strokeWidth="3"
              strokeDasharray={slots.whole === null ? '8,4' : '0'}
              style={{ transition: 'all 0.3s ease', animation: wrongSlot === 'whole' ? 'shake 0.4s' : 'none' }}
            />
            <text x="150" y="50" textAnchor="middle" fill={slots.whole !== null ? '#FFF' : 'rgba(255,255,255,0.4)'}
              fontSize="22" fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {slots.whole !== null ? slots.whole : 'Whole'}
            </text>
          </g>

          {/* Part 1 circle (bottom-left) */}
          <g onClick={() => handleSlotClick('part1')} style={{ cursor: slots.part1 === null && draggedChip !== null ? 'pointer' : 'default' }}>
            <circle cx="70" cy="155" r="30"
              fill={slots.part1 !== null ? '#FF8A50' : 'rgba(255,255,255,0.08)'}
              stroke={wrongSlot === 'part1' ? '#ff1744' : (slots.part1 !== null ? '#E65C00' : 'rgba(255,255,255,0.3)')}
              strokeWidth="3"
              strokeDasharray={slots.part1 === null ? '8,4' : '0'}
              style={{ transition: 'all 0.3s ease', animation: wrongSlot === 'part1' ? 'shake 0.4s' : 'none' }}
            />
            <text x="70" y="162" textAnchor="middle" fill={slots.part1 !== null ? '#FFF' : 'rgba(255,255,255,0.4)'}
              fontSize="20" fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {slots.part1 !== null ? slots.part1 : 'Part'}
            </text>
          </g>

          {/* Part 2 circle (bottom-right) */}
          <g onClick={() => handleSlotClick('part2')} style={{ cursor: slots.part2 === null && draggedChip !== null ? 'pointer' : 'default' }}>
            <circle cx="230" cy="155" r="30"
              fill={slots.part2 !== null ? '#FF8A50' : 'rgba(255,255,255,0.08)'}
              stroke={wrongSlot === 'part2' ? '#ff1744' : (slots.part2 !== null ? '#E65C00' : 'rgba(255,255,255,0.3)')}
              strokeWidth="3"
              strokeDasharray={slots.part2 === null ? '8,4' : '0'}
              style={{ transition: 'all 0.3s ease', animation: wrongSlot === 'part2' ? 'shake 0.4s' : 'none' }}
            />
            <text x="230" y="162" textAnchor="middle" fill={slots.part2 !== null ? '#FFF' : 'rgba(255,255,255,0.4)'}
              fontSize="20" fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {slots.part2 !== null ? slots.part2 : 'Part'}
            </text>
          </g>

          {/* Labels */}
          <text x="150" y="14" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="600">WHOLE</text>
          <text x="70" y="195" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="600">PART</text>
          <text x="230" y="195" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="600">PART</text>
        </svg>

        {/* Sparkles */}
        {sparkles.map(s => (
          <div key={s.id} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            fontSize: '1.5rem', animation: `sparkle 1s ${s.delay}s ease-out forwards`,
            pointerEvents: 'none'
          }}>✨</div>
        ))}
      </div>

      {/* Number Chips */}
      {step !== 2 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {chips.map((val) => {
            const isUsed = usedChips.has(val);
            const isSelected = draggedChip === val;
            return (
              <button key={val}
                onClick={() => handleChipClick(val)}
                disabled={isUsed}
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                  background: isUsed ? 'rgba(255,255,255,0.05)' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                  color: isUsed ? 'rgba(255,255,255,0.2)' : isSelected ? '#1a1a2e' : 'var(--text-primary)',
                  border: `3px solid ${isUsed ? 'transparent' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
                  cursor: isUsed ? 'not-allowed' : 'pointer',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 20px rgba(255,193,7,0.4)' : 'none'
                }}>
                {val}
              </button>
            );
          })}
        </div>
      )}

      {/* Undo buttons */}
      {step === 1 && (slots.whole !== null || slots.part1 !== null || slots.part2 !== null) && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {slots.whole !== null && <button className="btn btn-sm btn-outline" onClick={() => handleRemoveFromSlot('whole')}>↩ Remove {slots.whole}</button>}
          {slots.part1 !== null && <button className="btn btn-sm btn-outline" onClick={() => handleRemoveFromSlot('part1')}>↩ Remove {slots.part1}</button>}
          {slots.part2 !== null && <button className="btn btn-sm btn-outline" onClick={() => handleRemoveFromSlot('part2')}>↩ Remove {slots.part2}</button>}
        </div>
      )}

      {/* Done */}
      {step === 2 && (
        <div style={{ animation: 'bounceIn 0.5s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))',
            borderRadius: 16, padding: 20, marginBottom: 16, border: '2px solid rgba(76,175,80,0.3)'
          }}>
            <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--green-light)', fontWeight: 700 }}>
              ✅ {whole} – {part1} = {part2}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onNext}>
            Next Station →
          </button>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════
// STATION C: Write the Sentence (Tile Builder)
// ═══════════════════════════════════════════════════
function StationC({ audioEnabled, onComplete }) {
  const [story] = useState(() => pick(STORIES));
  const [whole] = useState(() => randInt(6, 12));
  const [part1] = useState(() => randInt(2, whole - 2));
  const part2 = whole - part1;
  const narRef = useRef(null);

  // Sentence building: _ – _ = _
  const [sentenceSlots, setSentenceSlots] = useState([null, null, null]); // [whole, part1, part2]
  const [answerSlots, setAnswerSlots] = useState([null, null]); // [name, number] for answer sentence
  const [step, setStep] = useState(0); // 0=intro, 1=sentence, 2=answer, 3=done
  const [selectedTile, setSelectedTile] = useState(null);
  const [wrongIdx, setWrongIdx] = useState(null);

  useEffect(() => {
    if (audioEnabled) {
      narRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narRef.current?.cancel(); };
  }, [audioEnabled]);

  // Number tiles for the math sentence
  const numberTiles = React.useMemo(() => {
    const extras = new Set();
    while (extras.size < 3) {
      const e = randInt(1, 20);
      if (e !== whole && e !== part1 && e !== part2) extras.add(e);
    }
    return [whole, part1, part2, ...extras].sort(() => Math.random() - 0.5);
  }, [whole, part1, part2]);

  const sentenceUsed = new Set(sentenceSlots.filter(v => v !== null));

  const handleTileClick = (val) => {
    if (step === 3) return;
    setSelectedTile(selectedTile === val ? null : val);
  };

  const handleSentenceSlotClick = (idx) => {
    if (step !== 1 || selectedTile === null) return;
    if (sentenceSlots[idx] !== null) return;

    const expected = [whole, part1, part2][idx];
    if (selectedTile === expected) {
      sounds.click();
      const newSlots = [...sentenceSlots];
      newSlots[idx] = selectedTile;
      setSentenceSlots(newSlots);
      setSelectedTile(null);

      // Check completion
      if (newSlots.every(v => v !== null)) {
        sounds.correct();
        setTimeout(() => setStep(2), 800);
      }
    } else {
      sounds.wrong();
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
    }
  };

  // Answer sentence tiles
  const answerTiles = React.useMemo(() => {
    return [`${story.name}`, `${part2}`].sort(() => Math.random() - 0.5);
  }, [story.name, part2]);

  const [selectedAnswerTile, setSelectedAnswerTile] = useState(null);

  const handleAnswerTileClick = (val) => {
    if (step !== 2) return;
    setSelectedAnswerTile(selectedAnswerTile === val ? null : val);
  };

  const handleAnswerSlotClick = (idx) => {
    if (step !== 2 || selectedAnswerTile === null) return;
    if (answerSlots[idx] !== null) return;

    const expected = idx === 0 ? story.name : `${part2}`;
    if (selectedAnswerTile === expected) {
      sounds.click();
      const newSlots = [...answerSlots];
      newSlots[idx] = selectedAnswerTile;
      setAnswerSlots(newSlots);
      setSelectedAnswerTile(null);

      if (newSlots.every(v => v !== null)) {
        sounds.correct();
        if (audioEnabled) {
          narRef.current?.cancel();
          narRef.current = narrate([
            celebrate(`Amazing! You wrote the whole word problem solution!`)
          ], true);
        }
        setTimeout(() => setStep(3), 800);
      }
    } else {
      sounds.wrong();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>✏️ Station C: Write the Sentence</h2></div>

      {/* Story context */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '12px 20px', marginBottom: 20, textAlign: 'left'
      }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
          <strong>{story.name}</strong> had <strong style={{ color: 'var(--gold)' }}>{whole}</strong> {story.obj}.
          {' '}{story.name === 'Siti' || story.name === 'Priya' ? 'She' : 'He'} {story.verb}{' '}
          <strong style={{ color: 'var(--coral)' }}>{part1}</strong>.
          How many {story.obj} are left?
        </p>
      </div>

      {step === 0 && (
        <div style={{ animation: 'slideUp 0.4s ease' }}>
          <div className="mascot-container" style={{ marginBottom: 16 }}>
            <div className="mascot" style={{ width: 60, height: 60 }}>🤖</div>
            <div className="speech-bubble">Now write the subtraction sentence! Tap a number, then tap the box where it goes.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setStep(1)}>
            ✏️ Start Writing
          </button>
        </div>
      )}

      {/* Step 1: Build subtraction sentence */}
      {step >= 1 && (
        <div style={{ animation: step === 1 ? 'slideUp 0.3s ease' : 'none', marginBottom: 24 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600, fontSize: '0.9rem' }}>
            📝 Number Sentence:
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
            fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: 20
          }}>
            {/* Whole slot */}
            <div onClick={() => handleSentenceSlotClick(0)} style={{
              width: 64, height: 64, borderRadius: 12,
              border: `3px ${sentenceSlots[0] !== null ? 'solid var(--blue)' : 'dashed rgba(255,255,255,0.3)'}`,
              background: sentenceSlots[0] !== null ? 'rgba(74,144,217,0.2)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 1 && sentenceSlots[0] === null && selectedTile !== null ? 'pointer' : 'default',
              color: sentenceSlots[0] !== null ? 'var(--blue)' : 'rgba(255,255,255,0.3)',
              fontWeight: 700, transition: 'all 0.3s ease',
              animation: wrongIdx === 0 ? 'shake 0.4s' : (sentenceSlots[0] !== null ? 'bounceIn 0.3s' : 'none')
            }}>
              {sentenceSlots[0] !== null ? sentenceSlots[0] : '?'}
            </div>

            <span style={{ color: 'var(--coral)', fontWeight: 700 }}>–</span>

            {/* Part1 slot */}
            <div onClick={() => handleSentenceSlotClick(1)} style={{
              width: 64, height: 64, borderRadius: 12,
              border: `3px ${sentenceSlots[1] !== null ? 'solid var(--coral)' : 'dashed rgba(255,255,255,0.3)'}`,
              background: sentenceSlots[1] !== null ? 'rgba(255,138,80,0.2)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 1 && sentenceSlots[1] === null && selectedTile !== null ? 'pointer' : 'default',
              color: sentenceSlots[1] !== null ? 'var(--coral)' : 'rgba(255,255,255,0.3)',
              fontWeight: 700, transition: 'all 0.3s ease',
              animation: wrongIdx === 1 ? 'shake 0.4s' : (sentenceSlots[1] !== null ? 'bounceIn 0.3s' : 'none')
            }}>
              {sentenceSlots[1] !== null ? sentenceSlots[1] : '?'}
            </div>

            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>=</span>

            {/* Part2 slot */}
            <div onClick={() => handleSentenceSlotClick(2)} style={{
              width: 64, height: 64, borderRadius: 12,
              border: `3px ${sentenceSlots[2] !== null ? 'solid var(--green-light)' : 'dashed rgba(255,255,255,0.3)'}`,
              background: sentenceSlots[2] !== null ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 1 && sentenceSlots[2] === null && selectedTile !== null ? 'pointer' : 'default',
              color: sentenceSlots[2] !== null ? 'var(--green-light)' : 'rgba(255,255,255,0.3)',
              fontWeight: 700, transition: 'all 0.3s ease',
              animation: wrongIdx === 2 ? 'shake 0.4s' : (sentenceSlots[2] !== null ? 'bounceIn 0.3s' : 'none')
            }}>
              {sentenceSlots[2] !== null ? sentenceSlots[2] : '?'}
            </div>
          </div>

          {/* Number tiles */}
          {step === 1 && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {numberTiles.map((val) => {
                const isUsed = sentenceUsed.has(val);
                const isSelected = selectedTile === val;
                return (
                  <button key={val}
                    onClick={() => handleTileClick(val)}
                    disabled={isUsed}
                    style={{
                      width: 52, height: 52, borderRadius: 12,
                      fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                      background: isUsed ? 'rgba(255,255,255,0.03)' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                      color: isUsed ? 'rgba(255,255,255,0.15)' : isSelected ? '#1a1a2e' : 'var(--text-primary)',
                      border: `2px solid ${isUsed ? 'transparent' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`,
                      cursor: isUsed ? 'not-allowed' : 'pointer',
                      transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 16px rgba(255,193,7,0.3)' : 'none'
                    }}>
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Answer sentence */}
      {step === 2 && (
        <div style={{ animation: 'slideUp 0.4s ease', marginBottom: 24 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600, fontSize: '0.9rem' }}>
            📝 Complete the answer:
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            fontSize: '1.2rem', fontFamily: 'var(--font-display)', flexWrap: 'wrap', marginBottom: 16
          }}>
            {/* Name slot */}
            <div onClick={() => handleAnswerSlotClick(0)} style={{
              minWidth: 90, height: 44, borderRadius: 10, padding: '0 12px',
              border: `2px ${answerSlots[0] !== null ? 'solid var(--blue)' : 'dashed rgba(255,255,255,0.3)'}`,
              background: answerSlots[0] !== null ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 2 && answerSlots[0] === null && selectedAnswerTile !== null ? 'pointer' : 'default',
              color: answerSlots[0] !== null ? 'var(--blue)' : 'rgba(255,255,255,0.3)',
              fontWeight: 600, transition: 'all 0.3s ease'
            }}>
              {answerSlots[0] || '___'}
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>has</span>
            {/* Number slot */}
            <div onClick={() => handleAnswerSlotClick(1)} style={{
              width: 50, height: 44, borderRadius: 10,
              border: `2px ${answerSlots[1] !== null ? 'solid var(--green-light)' : 'dashed rgba(255,255,255,0.3)'}`,
              background: answerSlots[1] !== null ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: step === 2 && answerSlots[1] === null && selectedAnswerTile !== null ? 'pointer' : 'default',
              color: answerSlots[1] !== null ? 'var(--green-light)' : 'rgba(255,255,255,0.3)',
              fontWeight: 700, fontSize: '1.4rem', transition: 'all 0.3s ease'
            }}>
              {answerSlots[1] || '?'}
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{story.obj} left.</span>
          </div>

          {/* Answer tiles */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {answerTiles.map((val) => {
              const isUsed = Object.values(answerSlots).includes(val);
              const isSelected = selectedAnswerTile === val;
              return (
                <button key={val}
                  onClick={() => handleAnswerTileClick(val)}
                  disabled={isUsed}
                  style={{
                    minWidth: 60, height: 44, borderRadius: 10, padding: '0 16px',
                    fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-display)',
                    background: isUsed ? 'rgba(255,255,255,0.03)' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    color: isUsed ? 'rgba(255,255,255,0.15)' : isSelected ? '#1a1a2e' : 'var(--text-primary)',
                    border: `2px solid ${isUsed ? 'transparent' : isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`,
                    cursor: isUsed ? 'not-allowed' : 'pointer',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}>
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: All Done */}
      {step === 3 && (
        <div style={{ animation: 'bounceIn 0.5s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))',
            borderRadius: 16, padding: 24, marginBottom: 16, border: '2px solid rgba(76,175,80,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--green-light)', fontWeight: 700, marginBottom: 8 }}>
              {whole} – {part1} = {part2}
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {story.name} has {part2} {story.obj} left.
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => { narRef.current?.cancel(); stopNarration(); onComplete(); }}>
            🎉 Complete Simulation!
          </button>
        </div>
      )}
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
            <span className="simulate-dot-label">{s.icon} {s.title}</span>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ maxWidth: 800, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {station === 0 && <StationA audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 1 && <StationB audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 2 && <StationC audioEnabled={audioEnabled} onComplete={onComplete} />}
      </div>
    </div>
  );
}
