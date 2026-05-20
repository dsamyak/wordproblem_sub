import { useState, useCallback } from 'react';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import PlayPhase from './components/PlayPhase';
import ReflectPhase from './components/ReflectPhase';
import FloatingNumbers from './components/FloatingNumbers';

const PHASES = [
  { id: 'wonder', label: 'Wonder', icon: '🔍', num: '01' },
  { id: 'story', label: 'Story', icon: '📖', num: '02' },
  { id: 'simulate', label: 'Simulate', icon: '🧪', num: '03' },
  { id: 'play', label: 'Play', icon: '🎮', num: '04' },
  { id: 'reflect', label: 'Reflect', icon: '📓', num: '05' },
];

const STORAGE_KEY = 'intellia_number_bonds_subtraction_v1';

function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
}

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playStats, setPlayStats] = useState(null);

  const goHome = useCallback(() => setPhase('intro'), []);

  const handleWonderComplete = useCallback(() => setPhase('story'), []);
  const handleStoryComplete = useCallback(() => setPhase('simulate'), []);
  const handleSimulateComplete = useCallback(() => setPhase('play'), []);

  const handlePlayComplete = useCallback((stats) => {
    setPlayStats(stats);
    saveProgress({ phase: 'reflect', stats });
    setPhase('reflect');
  }, []);

  const handleRestart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase('intro');
    setPlayStats(null);
  }, []);

  const currentPhaseIndex = PHASES.findIndex(p => p.id === phase);

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">
        {/* Audio toggle */}
        <button
          onClick={() => setAudioEnabled(a => !a)}
          className="audio-toggle-btn"
          aria-label="Toggle audio"
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* Journey progress bar */}
        {phase !== 'intro' && (
          <div className="journey-bar">
            {PHASES.map((p, i) => (
              <div key={p.id} className={`journey-step ${p.id === phase ? 'active' : i < currentPhaseIndex ? 'completed' : ''}`}>
                <div className="journey-step-dot">
                  {i < currentPhaseIndex ? '✓' : p.num}
                </div>
                <span className="journey-step-label">{p.icon} {p.label}</span>
                {i < PHASES.length - 1 && (
                  <div className={`journey-connector ${i < currentPhaseIndex ? 'filled' : ''}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Home button */}
        {phase !== 'intro' && (
          <button className="home-btn" onClick={goHome} aria-label="Go home">
            🏠 Home
          </button>
        )}

        {/* Phases */}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('wonder')}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(a => !a)}
          />
        )}

        {phase === 'wonder' && (
          <WonderPhase onComplete={handleWonderComplete} audioEnabled={audioEnabled} />
        )}

        {phase === 'story' && (
          <StoryPhase onComplete={handleStoryComplete} audioEnabled={audioEnabled} />
        )}

        {phase === 'simulate' && (
          <SimulatePhase onComplete={handleSimulateComplete} audioEnabled={audioEnabled} />
        )}

        {phase === 'play' && (
          <PlayPhase onComplete={handlePlayComplete} audioEnabled={audioEnabled} />
        )}

        {phase === 'reflect' && (
          <ReflectPhase
            stats={playStats}
            onRestart={handleRestart}
            onGoHome={goHome}
            audioEnabled={audioEnabled}
          />
        )}
      </div>
    </>
  );
}
