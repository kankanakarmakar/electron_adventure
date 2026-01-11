import { useState, useEffect, useCallback } from 'react';
import { SparkMascot } from '../SparkMascot';
import { PopupNotification } from '../PopupNotification';
import { EducationalPanel } from '../EducationalPanel';
import { SummaryPanel } from '../SummaryPanel';
import { StepIndicator } from '../StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Sparkles, Lightbulb, Sigma } from 'lucide-react';

interface InductorStageProps {
  onComplete: (stars: number) => void;
  onStepChange?: (step: number) => void;
  onSwitchChange?: (isOn: boolean) => void;
  onDirectionFlip?: () => void;
}

const STEPS = [
  { message: "Tap the switch to turn on the circuit!", type: 'action' as const },
  { message: "Watch the magnetic field grow around the coil!", type: 'learn' as const },
  { message: "Tap the flip button to reverse the current!", type: 'action' as const },
  { message: "Mini-game: Tap in rhythm to sustain the swirl!", type: 'action' as const },
];

export const InductorStage = ({ onComplete, onStepChange, onSwitchChange, onDirectionFlip }: InductorStageProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEducation, setShowEducation] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [sparkMessage, setSparkMessage] = useState("Welcome to Inductor Galaxy!");
  const [sparkMood, setSparkMood] = useState<'idle' | 'speaking' | 'celebrating' | 'encouraging'>('idle');

  // Step states
  const [currentOn, setCurrentOn] = useState(false);
  const [fieldStrength, setFieldStrength] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'reverse'>('forward');
  const [gameActive, setGameActive] = useState(false);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [targetPulse, setTargetPulse] = useState(false);
  
  // Interactive parameters for voltage calculation
  const [inductance, setInductance] = useState(10); // L in mH (millihenries)
  const [currentRate, setCurrentRate] = useState(5); // dI/dt in A/s
  const [currentValue, setCurrentValue] = useState(0); // I in A
  
  // Calculate voltage V = L * dI/dt
  const calculatedVoltage = (inductance / 1000) * currentRate; // Convert mH to H

  const FUN_FACTS = [
    {
      title: 'Wireless Wonders',
      text: 'Inductors help phones charge wirelessly by creating magnetic fields that transfer energy through the air!'
    },
    {
      title: 'Music Makers',
      text: 'In speakers, inductors and magnets dance together to turn electrical signals into sound.'
    },
    {
      title: 'Signal Shapers',
      text: 'Inductors smooth noisy electricity in power supplies—think of them as calming swirls in a river of electrons.'
    },
    {
      title: 'Transformer Friends',
      text: 'Coils team up inside transformers to change voltages safely for everyday devices.'
    },
  ];

  useEffect(() => {
    if (!showEducation && currentStep < STEPS.length) {
      setPopupVisible(true);
    }
  }, [currentStep, showEducation]);

  // Animate field growth when current is on
  useEffect(() => {
    if (currentOn && !gameActive) {
      const interval = setInterval(() => {
        setFieldStrength(prev => Math.min(100, prev + 2));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentOn, gameActive]);

  // Rhythm game logic
  useEffect(() => {
    if (gameActive) {
      const pulseInterval = setInterval(() => {
        setTargetPulse(true);
        setTimeout(() => setTargetPulse(false), 800);
      }, 1500);

      const endGame = setTimeout(() => {
        setGameActive(false);
        const starsEarned = rhythmScore >= 8 ? 3 : rhythmScore >= 5 ? 2 : 1;
        setSparkMessage(`Fantastic rhythm! Score: ${rhythmScore}!`);
        setSparkMood('celebrating');
        setTimeout(() => setShowSummary(true), 1500);
      }, 12000);

      return () => {
        clearInterval(pulseInterval);
        clearTimeout(endGame);
      };
    }
  }, [gameActive, rhythmScore]);

  const handlePopupDismiss = useCallback(() => {
    setPopupVisible(false);
  }, []);

  const handleSwitchOn = () => {
    if (currentStep === 0 && !currentOn) {
      setCurrentOn(true);
      onSwitchChange?.(true);
      setSparkMessage("Current flowing! Watch the magnetic field form!");
      setSparkMood('celebrating');
      setTimeout(() => {
        setCurrentStep(1);
        onStepChange?.(1);
        setSparkMood('speaking');
        setSparkMessage("See those blue rings? That's the magnetic field!");
        setTimeout(() => {
          setCurrentStep(2);
          onStepChange?.(2);
          setSparkMessage("Try flipping the current direction!");
        }, 3000);
      }, 1500);
    }
  };

  const handleFlipCurrent = () => {
    if (currentStep === 2) {
      setCurrentDirection(prev => prev === 'forward' ? 'reverse' : 'forward');
      setFieldStrength(0);
      onDirectionFlip?.();
      setSparkMessage(currentDirection === 'forward' 
        ? "Current reversed! The field rebuilds in the opposite way!" 
        : "Back to forward! Notice how the field changes!");
      setSparkMood('encouraging');
    }
  };

  const handleStartGame = () => {
    setCurrentStep(3);
    setGameActive(true);
    setRhythmScore(0);
    setSparkMessage("Tap when the ring pulses bright!");
    setSparkMood('encouraging');
  };

  const handleRhythmTap = () => {
    if (gameActive && targetPulse) {
      setRhythmScore(prev => prev + 1);
      setFieldStrength(prev => Math.min(100, prev + 15));
    }
  };

  const starsEarned = rhythmScore >= 8 ? 3 : rhythmScore >= 5 ? 2 : 1;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
      {/* Educational Panel */}
      <EducationalPanel
        isVisible={showEducation}
        onClose={() => setShowEducation(false)}
        title="Welcome to Inductor Galaxy! 🔵"
        explanation="When electricity flows through a coiled wire, it creates an invisible magnetic force field! This magical property is called inductance."
        formula="L = Φ / I"
        formulaExplanation="Inductance equals Magnetic Flux divided by Current"
        didYouKnow="Inductors are used in wireless phone chargers — they transfer energy through magnetism without any wires touching!"
        stageColor="inductor"
      />

      {/* Step Indicator */}
      {!showEducation && !showSummary && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <StepIndicator currentStep={currentStep} totalSteps={4} stageColor="inductor" />
        </div>
      )}

      {/* Popup Notification */}
      {currentStep < STEPS.length && (
        <PopupNotification
          isVisible={popupVisible && !showEducation}
          message={STEPS[currentStep].message}
          type={STEPS[currentStep].type}
          onDismiss={handlePopupDismiss}
        />
      )}

      {/* Main Stage Content */}
      {!showEducation && !showSummary && (
        <div className="relative w-full max-w-4xl">
          <div className="relative rounded-3xl border border-inductor/25 p-8 min-h-[450px]" style={{
            background: 'linear-gradient(135deg, hsl(var(--card)/1) 0%, hsl(var(--background)/1) 100%)',
            boxShadow: '0 24px 60px hsl(var(--inductor-glow)/0.12)'
          }}>
            {/* Heading in top left corner */}
            <div className="absolute top-6 left-6 z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-inductor flex items-center gap-2">
                🧲 What is an Inductor?
              </h2>
            </div>

            {/* Inductor Circuit visualization */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Magnetic field rings */}
                {currentOn && (
                  <>
                    {[1, 2, 3, 4].map((ring) => (
                      <ellipse
                        key={ring}
                        cx="300"
                        cy="200"
                        rx={60 + ring * 30 * (fieldStrength / 100)}
                        ry={40 + ring * 20 * (fieldStrength / 100)}
                        fill="none"
                        stroke="hsl(var(--inductor))"
                        strokeWidth="2"
                        opacity={fieldStrength / 150}
                        style={{
                          transformOrigin: '300px 200px',
                          animation: currentDirection === 'reverse' ? `spin-reverse ${3 + ring}s linear infinite` : `spin-forward ${3 + ring}s linear infinite`
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Battery on the left */}
                <g transform="translate(50, 150)">
                  <rect x="0" y="0" width="40" height="100" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2"/>
                  <rect x="15" y="-8" width="10" height="8" rx="2" fill="hsl(var(--muted))"/>
                  {/* Polarity changes with current direction */}
                  <text x="20" y="40" textAnchor="middle" fill="hsl(var(--primary))" fontSize="24" fontWeight="bold" className="transition-all duration-500">
                    {currentDirection === 'forward' ? '+' : '−'}
                  </text>
                  <text x="20" y="75" textAnchor="middle" fill="hsl(var(--destructive))" fontSize="24" fontWeight="bold" className="transition-all duration-500">
                    {currentDirection === 'forward' ? '−' : '+'}
                  </text>
                  <text x="20" y="-20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10" className="animate-pulse">
                    {currentDirection === 'reverse' && currentOn ? 'Polarity Flipped!' : ''}
                  </text>
                </g>

                {/* Wire from battery + to switch */}
                <line x1="90" y1="170" x2="150" y2="170" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                {currentOn && (
                  <>
                    <circle cx="100" cy="170" r="3" fill="hsl(var(--electron-blue))">
                      <animate attributeName="cx" from="90" to="150" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="120" cy="170" r="3" fill="hsl(var(--electron-blue))">
                      <animate attributeName="cx" from="90" to="150" dur="1s" begin="0.3s" repeatCount="indefinite"/>
                    </circle>
                  </>
                )}

                {/* Switch (clickable) */}
                <g 
                  transform="translate(150, 150)" 
                  style={{ cursor: 'pointer' }}
                  onClick={currentStep >= 0 ? handleSwitchOn : undefined}
                  className="hover:opacity-80 transition-opacity"
                >
                  <rect x="0" y="0" width="60" height="40" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2"/>
                  <line 
                    x1="10" 
                    y1="20" 
                    x2={currentOn ? "50" : "30"} 
                    y2="20" 
                    stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <circle cx={currentOn ? "50" : "30"} cy="20" r="6" fill={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} className="transition-all duration-300"/>
                  <text x="30" y="55" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">{currentOn ? 'ON' : 'OFF'}</text>
                </g>

                {/* Wire from switch to inductor coil */}
                <line x1="210" y1="170" x2="240" y2="170" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                {currentOn && (
                  <circle cx="220" cy="170" r="3" fill="hsl(var(--electron-blue))">
                    <animate attributeName="cx" from="210" to="240" dur="0.8s" repeatCount="indefinite"/>
                  </circle>
                )}

                {/* Inductor Coil (multiple loops) */}
                <g transform="translate(240, 150)" onClick={handleRhythmTap} style={{ cursor: gameActive ? 'pointer' : 'default' }}>
                  {/* Coil windings */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <ellipse
                      key={i}
                      cx={i * 20}
                      cy="20"
                      rx="10"
                      ry="15"
                      fill="none"
                      stroke={currentOn ? 'hsl(var(--inductor))' : 'hsl(var(--muted))'}
                      strokeWidth="3"
                      filter={currentOn ? 'url(#glow)' : undefined}
                      className={targetPulse ? 'brightness-150 scale-110' : ''}
                    />
                  ))}
                  {/* Core/tube through center */}
                  <rect x="0" y="10" width="80" height="20" rx="4" fill="hsl(var(--muted)/0.3)" stroke="hsl(var(--border))" strokeWidth="1"/>
                  
                  {/* Current direction indicator */}
                  {currentOn && (
                    <text 
                      x="40" 
                      y="60" 
                      textAnchor="middle" 
                      fontSize="24"
                      className={`transition-transform ${currentDirection === 'reverse' ? 'rotate-180' : ''}`}
                    >
                      {currentDirection === 'forward' ? '→' : '←'}
                    </text>
                  )}
                </g>

                {/* Wire from coil to battery - */}
                <line x1="320" y1="170" x2="350" y2="170" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                <line x1="350" y1="170" x2="350" y2="230" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                <line x1="350" y1="230" x2="70" y2="230" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                <line x1="70" y1="230" x2="70" y2="250" stroke={currentOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} strokeWidth="3"/>
                
                {currentOn && (
                  <>
                    <circle cx="335" cy="170" r="3" fill="hsl(var(--electron-blue))">
                      <animate attributeName="cx" from="320" to="350" dur="0.8s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="350" cy="200" r="3" fill="hsl(var(--electron-blue))">
                      <animate attributeName="cy" from="170" to="230" dur="0.8s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="200" cy="230" r="3" fill="hsl(var(--electron-blue))">
                      <animate attributeName="cx" from="350" to="70" dur="1.2s" repeatCount="indefinite"/>
                    </circle>
                  </>
                )}

                {/* Labels */}
                <text x="70" y="140" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Battery</text>
                <text x="180" y="140" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Switch</text>
                <text x="280" y="120" textAnchor="middle" fill="hsl(var(--inductor))" fontSize="14" fontWeight="bold">Inductor Coil</text>
                
                {currentOn && (
                  <text x="300" y="320" textAnchor="middle" fill="hsl(var(--inductor))" fontSize="16" fontWeight="bold" className="animate-pulse">
                    ⚡ Magnetic Field Generated ⚡
                  </text>
                )}

                {/* Game score display */}
                {gameActive && (
                  <text x="500" y="40" textAnchor="middle" fill="hsl(var(--inductor))" fontSize="20" fontWeight="bold">
                    Score: {rhythmScore}
                  </text>
                )}
              </svg>
            </div>



            {/* Game score */}
            {gameActive && (
              <div className="absolute top-4 right-4 bg-inductor/20 backdrop-blur-sm rounded-full px-6 py-3 border border-inductor/50">
                <span className="text-inductor font-bold text-2xl">Score: {rhythmScore}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          {!gameActive && (
            <div className="mt-8 flex justify-center gap-4">
              {currentStep >= 2 && (
                <>
                  <Button
                    onClick={handleFlipCurrent}
                    variant="outline"
                    className="px-8 py-6 text-lg font-bold rounded-full border-inductor text-inductor hover:bg-inductor/20"
                  >
                    🔄 Flip Direction
                  </Button>
                  <Button
                    onClick={handleStartGame}
                    className="px-8 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-inductor to-inductor-glow hover:scale-105 transition-transform"
                  >
                    🎮 Start Rhythm Game!
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Game instruction */}
          {gameActive && (
            <div className="mt-8 text-center">
              <p className="text-xl text-muted-foreground animate-pulse">
                Tap the coil when it glows bright! ✨
              </p>
            </div>
          )}

          {/* Informative Popup Cards */}
          {currentOn && currentStep >= 1 && currentStep < 3 && (
            <div className="mt-6 bg-inductor/10 border border-inductor/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="text-lg font-bold text-inductor mb-2">How Inductors Work</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    When current flows through the coil, it creates a <strong className="text-inductor">magnetic field</strong> around it. 
                    The inductor stores energy in this magnetic field!
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-card/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Current Increases</div>
                      <div className="text-sm text-foreground">→ Magnetic field <strong className="text-inductor">grows</strong></div>
                      <div className="text-xs text-muted-foreground">→ Voltage across inductor</div>
                    </div>
                    <div className="bg-card/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Current Reverses</div>
                      <div className="text-sm text-foreground">→ Field <strong className="text-inductor">reverses</strong> direction</div>
                      <div className="text-xs text-muted-foreground">→ Polarity flips!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Interactive Graph and Controls */}
          {currentOn && currentStep >= 1 && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graph Section */}
              <Card className="lg:col-span-2 bg-card/60 border-inductor/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inductor">
                    <Sparkles className="w-5 h-5" />
                    Inductor Behavior Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-80 bg-background/50 rounded-xl p-6">
                    <svg viewBox="0 0 500 280" className="w-full h-full">
                      {/* Grid */}
                      <defs>
                        <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="500" height="280" fill="url(#grid)"/>
                      
                      {/* Axes */}
                      <line x1="50" y1="20" x2="50" y2="240" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                      <line x1="50" y1="240" x2="470" y2="240" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                      
                      {/* Labels */}
                      <text x="260" y="270" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">Time →</text>
                      <text x="20" y="130" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold" transform="rotate(-90 20 130)">Current (A)</text>
                      
                      {/* Current curve (ramping up) */}
                      <path
                        d={`M 50 240 Q 120 ${240 - fieldStrength * 2} 250 ${240 - fieldStrength * 2.1} T 450 ${240 - fieldStrength * 2.1}`}
                        fill="none"
                        stroke="hsl(var(--inductor))"
                        strokeWidth="4"
                        className="transition-all duration-500"
                      />
                      
                      {/* Voltage spike (showing V = L * dI/dt) */}
                      <path
                        d={`M 50 240 L 80 ${fieldStrength > 20 ? 60 : 240} L 110 240`}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        opacity="0.8"
                      />
                      
                      {/* Direction indicator */}
                      {currentDirection === 'reverse' && (
                        <text x="380" y="40" textAnchor="middle" fill="hsl(var(--destructive))" fontSize="16" fontWeight="bold" className="animate-pulse">
                          ← REVERSED
                        </text>
                      )}
                      
                      {/* Field strength indicator */}
                      <circle 
                        cx="450" 
                        cy={240 - fieldStrength * 2.1} 
                        r="6" 
                        fill="hsl(var(--inductor))" 
                        className="animate-pulse"
                      />
                    </svg>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-1.5 bg-inductor rounded"></div>
                        <span className="text-foreground text-base font-medium">Current (I)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-1.5 bg-primary rounded" style={{ borderTop: '3px dashed' }}></div>
                        <span className="text-foreground text-base font-semibold">Voltage (V = L·dI/dt)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Voltage Calculator */}
              <Card className="bg-gradient-to-br from-inductor/20 to-inductor/5 border-inductor/40 border-2">
                <CardHeader>
                  <CardTitle className="text-inductor text-lg">Live Voltage Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Live Display */}
                  <div className="bg-background/80 rounded-xl p-6 border-2 border-inductor/30">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">Calculated Voltage</div>
                      <div className="text-5xl font-bold text-inductor mb-2 animate-pulse">
                        {calculatedVoltage.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Volts (V)</div>
                    </div>
                    <div className="mt-4 p-3 bg-inductor/10 rounded-lg">
                      <div className="text-xs text-center text-muted-foreground">
                        V = L × (dI/dt)
                      </div>
                    </div>
                  </div>

                  {/* Parameter Controls */}
                  <div className="space-y-4">
                    {/* Inductance Control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">Inductance (L)</label>
                        <span className="text-sm font-bold text-inductor">{inductance} mH</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={inductance}
                        onChange={(e) => setInductance(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-inductor"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 mH</span>
                        <span>100 mH</span>
                      </div>
                    </div>

                    {/* Current Rate Control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">Rate of Change (dI/dt)</label>
                        <span className="text-sm font-bold text-inductor">{currentRate} A/s</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={currentRate}
                        onChange={(e) => setCurrentRate(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-inductor"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 A/s</span>
                        <span>50 A/s</span>
                      </div>
                    </div>

                    {/* Current Value Display */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground">Current (I)</label>
                        <span className="text-sm font-bold text-inductor">{(fieldStrength / 10).toFixed(1)} A</span>
                      </div>
                      <div className="h-2 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-inductor to-inductor-glow transition-all duration-500"
                          style={{ width: `${fieldStrength}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">Live from circuit</div>
                    </div>
                  </div>

                  {/* Key Insight */}
                  <div className="p-4 bg-inductor/10 rounded-lg border border-inductor/30">
                    <div className="text-xs text-muted-foreground mb-2">Key Insight:</div>
                    <div className="text-sm text-foreground leading-relaxed">
                      Higher <strong className="text-inductor">inductance</strong> or faster <strong className="text-inductor">current change</strong> = Higher voltage!
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bottom: Fun Facts + Formulas */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fun Facts Carousel */}
            <Card className="bg-card/60 border-inductor/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inductor">
                  <Lightbulb className="w-5 h-5" />
                  Fun Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent>
                    {FUN_FACTS.map((fact, idx) => (
                      <CarouselItem key={idx}>
                        <div className="p-4">
                          <div className="rounded-2xl border border-inductor/30 bg-gradient-to-br from-inductor/10 to-inductor-glow/10 p-6">
                            <h4 className="text-xl font-bold text-inductor mb-2">{fact.title}</h4>
                            <p className="text-muted-foreground leading-relaxed">{fact.text}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="border-inductor text-inductor hover:bg-inductor/10" />
                  <CarouselNext className="border-inductor text-inductor hover:bg-inductor/10" />
                </Carousel>
              </CardContent>
            </Card>

            {/* Formulas Card */}
            <Card className="bg-card/60 border-inductor/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inductor">
                  <Sigma className="w-5 h-5" />
                  Inductor Basics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-inductor/30 p-4 bg-inductor/5">
                    <div className="text-3xl font-mono font-bold text-inductor">L = Φ / I</div>
                    <p className="text-sm text-muted-foreground">Inductance equals magnetic flux divided by current.</p>
                  </div>
                  <div className="rounded-2xl border border-inductor/30 p-4 bg-inductor/5">
                    <div className="text-3xl font-mono font-bold text-inductor">V = L · dI/dt</div>
                    <p className="text-sm text-muted-foreground">Voltage across an inductor depends on how fast current changes.</p>
                  </div>
                  <div className="rounded-2xl border border-inductor/30 p-4 bg-inductor/5">
                    <div className="text-3xl font-mono font-bold text-inductor">E = ½ · L · I²</div>
                    <p className="text-sm text-muted-foreground">Energy stored in the magnetic field of the coil.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Summary Panel */}
      <SummaryPanel
        isVisible={showSummary}
        stageName="Inductor Galaxy"
        stageColor="inductor"
        badgeName="Magnetic Master"
        badgeIcon="🔵"
        starsEarned={starsEarned}
        summaryPoints={[
          "Inductors create magnetic fields when current flows",
          "The field stores energy in magnetic form",
          "Reversing current changes the field direction",
          "Inductance is measured in Henrys (H)",
        ]}
        onNextStage={() => onComplete(starsEarned)}
        onReplay={() => {
          setShowSummary(false);
          setShowEducation(true);
          setCurrentStep(0);
          setCurrentOn(false);
          setFieldStrength(0);
          setCurrentDirection('forward');
          setRhythmScore(0);
        }}
      />

      {/* Sparky Mascot */}
      {!showEducation && !showSummary && (
        <SparkMascot message={sparkMessage} mood={sparkMood} />
      )}
    </div>
  );
};
