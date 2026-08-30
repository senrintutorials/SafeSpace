import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Sparkles, RefreshCw, Volume2, Heart, Award, ArrowLeft, 
  Wind, Play, Pause, RotateCcw, Sun, Smile, Sprout, Droplets, 
  Scissors, Moon, Utensils, Bath, Music, CheckCircle2
} from 'lucide-react';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';

type GameTab = 'growing-plants' | 'care-pet' | 'memory-match' | 'bubble-pop' | 'mandala-color' | 'follow-beat';

// -------------------------------------------------------------
// SOUND SYNTHESIZER UTIL
// -------------------------------------------------------------
function playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.15) {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// -------------------------------------------------------------
// GAME 1: GROWING PLANTS SIMULATION (Zen Botanical Garden)
// -------------------------------------------------------------
interface PlantType {
  id: string;
  name: string;
  seedEmoji: string;
  flowerEmoji: string;
  description: string;
  color: string;
  growthRate: number;
}

const PLANT_TYPES: PlantType[] = [
  { id: 'sunflower', name: 'Golden Sunflower', seedEmoji: '🌻', flowerEmoji: '🌻', description: 'Brings warmth and positive solar energy.', color: 'text-amber-500', growthRate: 15 },
  { id: 'lavender', name: 'Calming Lavender', seedEmoji: '🪻', flowerEmoji: '🪻', description: 'Releases soothing aromas to ease exam anxiety.', color: 'text-purple-500', growthRate: 20 },
  { id: 'rose', name: 'Cosmic Rose', seedEmoji: '🌹', flowerEmoji: '🌹', description: 'Symbol of self-love and emotional resilience.', color: 'text-rose-500', growthRate: 12 },
  { id: 'fern', name: 'Zen Fern', seedEmoji: '🌿', flowerEmoji: '🌿', description: 'Purifies your mind and creates quiet headspace.', color: 'text-emerald-500', growthRate: 25 }
];

function ZenPlantGardenGame() {
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType>(PLANT_TYPES[0]);
  const [waterLevel, setWaterLevel] = useState<number>(40);
  const [sunlightLevel, setSunlightLevel] = useState<number>(50);
  const [growthProgress, setGrowthProgress] = useState<number>(10);
  const [harvestScore, setHarvestScore] = useState<number>(0);
  const [sparkleMessage, setSparkleMessage] = useState<string | null>(null);

  // Auto decay moisture & sunlight slightly over time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel((prev) => Math.max(0, prev - 1));
      setSunlightLevel((prev) => Math.max(0, prev - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleWater = () => {
    setWaterLevel((prev) => Math.min(100, prev + 25));
    playTone(523.25, 'sine', 0.2);
    boostGrowth('💧 Watered with care (+15% Growth)');
  };

  const handleSunlight = () => {
    setSunlightLevel((prev) => Math.min(100, prev + 25));
    playTone(659.25, 'triangle', 0.25);
    boostGrowth('☀️ Soaked up sunshine (+15% Growth)');
  };

  const handleFertilize = () => {
    playTone(783.99, 'sine', 0.3);
    boostGrowth('✨ Nourished with Love & Affirmations (+30% Growth)');
  };

  const boostGrowth = (msg: string) => {
    setSparkleMessage(msg);
    setTimeout(() => setSparkleMessage(null), 2500);

    setGrowthProgress((prev) => {
      const next = prev + selectedPlantType.growthRate;
      if (next >= 100) {
        playTone(1046.50, 'sine', 0.5);
        setHarvestScore((s) => s + 1);

        saveRecordedEntry({
          type: 'game',
          typeLabel: '🎮 Zen SafeSpace Games',
          title: `Harvested ${selectedPlantType.name}`,
          excerpt: `Completed full growth cycle of ${selectedPlantType.name} in Zen Garden Game.`,
          reportAnalysis: {
            dominantEmotion: 'Patience & Mindfulness',
            valenceScore: 0.93,
            arousalScore: 0.28,
            sentimentLabel: 'Mindful Achievement',
            summaryObservation: `User harvested a fully bloomed ${selectedPlantType.name} plant after attentive watering and nurturing.`,
            psychologistInsights: [
              'Mindful gaming provides healthy dopamine regulation and sensory grounding.',
              'Sustained attention on nurturing digital plants promotes emotional calmness.'
            ],
            guidanceNote: 'Zen Garden gameplay score logged to Dashboard history.',
            safetyStatus: 'SAFE'
          }
        });

        return 100;
      }
      return next;
    });
  };

  const handleReplant = (plant: PlantType) => {
    setSelectedPlantType(plant);
    setGrowthProgress(10);
    setWaterLevel(60);
    setSunlightLevel(60);
  };

  const getStageName = () => {
    if (growthProgress < 25) return 'Stage 1: Tiny Sprout 🌱';
    if (growthProgress < 55) return 'Stage 2: Growing Stems 🌿';
    if (growthProgress < 90) return 'Stage 3: Budding Petals 🌸';
    return 'Stage 4: Full Radiant Bloom 🌺';
  };

  const getPlantVisual = () => {
    if (growthProgress < 25) return <span className="text-5xl animate-bounce">🌱</span>;
    if (growthProgress < 55) return <span className="text-7xl">🪴</span>;
    if (growthProgress < 90) return <span className="text-8xl">🌸</span>;
    return <span className="text-9xl transform hover:scale-110 transition-transform drop-shadow-xl cursor-pointer">{selectedPlantType.flowerEmoji}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Garden Top Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>Zen Botanical Plant Growing Simulation</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Nourish your botanical plant with water, light, and love to bloom.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 flex items-center gap-1.5">
            🏆 {harvestScore} Flowers Harvested
          </span>
        </div>
      </div>

      {/* Main Plant Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Display Stage */}
        <div className="lg:col-span-2 bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 p-8 rounded-3xl border border-emerald-200 flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden shadow-inner">
          {sparkleMessage && (
            <div className="absolute top-4 px-4 py-2 rounded-full bg-white/90 text-emerald-800 text-xs font-black shadow-md border border-emerald-300 z-10">
              {sparkleMessage}
            </div>
          )}

          <div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-300/40 blur-2xl transition-all duration-700"
            style={{ opacity: sunlightLevel / 100 }}
          />

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black text-slate-800">
            <span>{getStageName()}</span>
            <span className="text-emerald-600">({Math.round(growthProgress)}%)</span>
          </div>

          <div className="my-auto flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              {getPlantVisual()}
              {growthProgress >= 100 && (
                <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                  BLOOMED! ✨
                </div>
              )}
            </div>
            <h4 className="text-base font-black text-slate-900">{selectedPlantType.name}</h4>
          </div>

          {/* Progress Bars */}
          <div className="w-full bg-white/90 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5 shadow-xs">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Soil Moisture</span>
                <span>{waterLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${waterLevel}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" /> Sunlight Energy</span>
                <span>{sunlightLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${sunlightLevel}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1"><Sprout className="w-3.5 h-3.5 text-emerald-600" /> Growth Progress</span>
                <span>{growthProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${growthProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Seed Selector */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Care Actions</h4>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={handleWater}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-black text-xs border border-blue-200 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-left">
                    <span className="block font-black text-slate-900">Water Plant</span>
                    <span className="block text-[10px] text-blue-600 font-semibold">+Moisture & Hydration</span>
                  </span>
                </div>
                <span className="text-xs">🚿</span>
              </button>

              <button
                onClick={handleSunlight}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs border border-amber-200 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-left">
                    <span className="block font-black text-slate-900">Give Sunshine</span>
                    <span className="block text-[10px] text-amber-700 font-semibold">+Photosynthesis Boost</span>
                  </span>
                </div>
                <span className="text-xs">☀️</span>
              </button>

              <button
                onClick={handleFertilize}
                className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-black text-xs border border-purple-200 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-left">
                    <span className="block font-black text-slate-900">Affirmation Fertilizer</span>
                    <span className="block text-[10px] text-purple-700 font-semibold">+30% Rapid Bloom</span>
                  </span>
                </div>
                <span className="text-xs">✨</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Select Plant Species</h4>
            <div className="grid grid-cols-2 gap-2">
              {PLANT_TYPES.map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => handleReplant(plant)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPlantType.id === plant.id
                      ? 'bg-emerald-900 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{plant.flowerEmoji}</span>
                  <span className="text-xs font-black block truncate">{plant.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 2: CARE A PET SIMULATION (Virtual Companion Sanctuary)
// -------------------------------------------------------------
interface PetOption {
  id: string;
  name: string;
  species: string;
  avatar: string;
  soundPitch: number;
  favoriteFood: string;
}

const PET_OPTIONS: PetOption[] = [
  { id: 'safie-panda', name: 'Safie 🐼', species: 'Zen Panda', avatar: '🐼', soundPitch: 400, favoriteFood: 'Bamboo Shoots 🎋' },
  { id: 'mochi-cat', name: 'Mochi 🐱', species: 'Cozy Kitten', avatar: '🐱', soundPitch: 600, favoriteFood: 'Warm Milk & Fish 🐟' },
  { id: 'barnaby-dog', name: 'Barnaby 🐶', species: 'Loyal Pup', avatar: '🐶', soundPitch: 500, favoriteFood: 'Crunchy Bone 🍖' },
  { id: 'ember-dragon', name: 'Ember 🐉', species: 'Calm Dragon', avatar: '🐉', soundPitch: 350, favoriteFood: 'Sparkle Berries 🫐' }
];

function VirtualPetCareGame() {
  const [selectedPet, setSelectedPet] = useState<PetOption>(PET_OPTIONS[0]);
  const [hunger, setHunger] = useState<number>(70);
  const [happiness, setHappiness] = useState<number>(85);
  const [energy, setEnergy] = useState<number>(60);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [petMoodText, setPetMoodText] = useState<string>("I'm feeling cozy and ready to play!");
  const [heartParticles, setHeartParticles] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSleeping) {
        setHunger((prev) => Math.max(0, prev - 1));
        setHappiness((prev) => Math.max(0, prev - 1));
        setEnergy((prev) => Math.max(0, prev - 1));
      } else {
        setEnergy((prev) => Math.min(100, prev + 3));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isSleeping]);

  const triggerHearts = (text: string) => {
    setPetMoodText(text);
    setHeartParticles(true);
    setTimeout(() => setHeartParticles(false), 2000);
  };

  const handleFeed = () => {
    if (isSleeping) return;
    setHunger((prev) => Math.min(100, prev + 30));
    playTone(selectedPet.soundPitch, 'sine', 0.2);
    triggerHearts(`Yum! ${selectedPet.name} loved the treat! 😋`);
  };

  const handlePet = () => {
    if (isSleeping) return;
    setHappiness((prev) => Math.min(100, prev + 25));
    playTone(selectedPet.soundPitch + 150, 'triangle', 0.25);
    triggerHearts(`Purr... ${selectedPet.name} feels super loved and happy! 💕`);
  };

  const handlePlay = () => {
    if (isSleeping) return;
    if (energy < 15) {
      setPetMoodText(`${selectedPet.name} is too tired to play! Needs a cozy nap. 💤`);
      return;
    }
    setHappiness((prev) => Math.min(100, prev + 20));
    setEnergy((prev) => Math.max(0, prev - 15));
    playTone(selectedPet.soundPitch + 300, 'sine', 0.3);
    triggerHearts(`Yay! Playing catch brought so much joy! 🎾`);
  };

  const handleToggleSleep = () => {
    setIsSleeping(!isSleeping);
    if (!isSleeping) {
      setPetMoodText(`Shh... ${selectedPet.name} is sleeping peacefully. 🌙`);
    } else {
      setPetMoodText(`Good morning! ${selectedPet.name} is refreshed! ☀️`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Smile className="w-5 h-5 text-purple-600" />
            <span>Virtual Companion Care Simulation</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Feed, pet, and nurture your supportive virtual pet companion.</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {PET_OPTIONS.map((pet) => (
            <button
              key={pet.id}
              onClick={() => {
                setSelectedPet(pet);
                setPetMoodText(`Met ${pet.name}! Let's be best friends.`);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                selectedPet.id === pet.id
                  ? 'bg-purple-900 text-white border-purple-700 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <span>{pet.avatar}</span>
              <span className="hidden sm:inline">{pet.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-8 rounded-3xl border flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden transition-colors duration-700 shadow-inner ${
          isSleeping ? 'bg-slate-950 text-white border-slate-800' : 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-50 text-slate-900 border-purple-200'
        }`}>
          {heartParticles && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="text-4xl animate-ping opacity-75">💖</span>
              <span className="text-3xl animate-bounce ml-6">✨</span>
              <span className="text-4xl animate-pulse mr-6">💕</span>
            </div>
          )}

          <div className="max-w-xs text-center bg-white/95 backdrop-blur-xs text-slate-900 px-4 py-2.5 rounded-2xl shadow-md border border-purple-200 text-xs font-black">
            {petMoodText}
          </div>

          <div className="my-auto flex flex-col items-center justify-center space-y-2 relative">
            <button
              onClick={handlePet}
              className={`text-9xl transition-all duration-300 transform active:scale-95 cursor-pointer hover:scale-105 ${
                isSleeping ? 'opacity-80 scale-95' : 'animate-bounce'
              }`}
              title="Click to Pet!"
            >
              {selectedPet.avatar}
            </button>
            {isSleeping && <span className="text-xl font-black text-indigo-400">Z z z ... 🌙</span>}
            <h4 className="text-lg font-black">{selectedPet.name} ({selectedPet.species})</h4>
          </div>

          <div className="w-full bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-purple-200 text-slate-900 space-y-2.5 shadow-xs">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">🍎 Hunger (Favorite: {selectedPet.favoriteFood})</span>
                <span>{hunger}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${hunger}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">💖 Happiness</span>
                <span>{happiness}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${happiness}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">⚡ Energy Level</span>
                <span>{energy}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${energy}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between shadow-2xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Pet Care Actions</h4>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleFeed}
              disabled={isSleeping}
              className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 font-black text-xs border border-amber-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-900">Feed Treat</span>
                  <span className="block text-[10px] text-amber-700 font-semibold">+Hunger & Joy</span>
                </div>
              </div>
              <span className="text-base">🥕</span>
            </button>

            <button
              onClick={handlePet}
              disabled={isSleeping}
              className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-900 font-black text-xs border border-rose-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-900">Pet & Cuddle</span>
                  <span className="block text-[10px] text-rose-700 font-semibold">+Love & Purrs</span>
                </div>
              </div>
              <span className="text-base">💕</span>
            </button>

            <button
              onClick={handlePlay}
              disabled={isSleeping}
              className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-900 font-black text-xs border border-purple-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-900">Play Game</span>
                  <span className="block text-[10px] text-purple-700 font-semibold">+Fun Activity</span>
                </div>
              </div>
              <span className="text-base">🎾</span>
            </button>

            <button
              onClick={handleToggleSleep}
              className={`w-full p-3.5 rounded-2xl font-black text-xs border flex items-center justify-between transition-all cursor-pointer ${
                isSleeping 
                  ? 'bg-indigo-900 text-white border-indigo-700' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-black">{isSleeping ? 'Wake Up Pet' : 'Tuck Into Bed'}</span>
                  <span className="block text-[10px] opacity-80 font-semibold">{isSleeping ? 'Restore energy' : 'Cozy nighttime rest'}</span>
                </div>
              </div>
              <span className="text-base">{isSleeping ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 3: EMPATHY MEMORY MATCH
// -------------------------------------------------------------
interface CardItem {
  id: number;
  symbol: string;
  word: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARDS_DATA = [
  { symbol: '🌸', word: 'Kindness' },
  { symbol: '✨', word: 'Hope' },
  { symbol: '🌿', word: 'Calm' },
  { symbol: '💖', word: 'Joy' },
  { symbol: '⭐', word: 'Courage' },
  { symbol: '🕊️', word: 'Peace' }
];

function EmpathyMemoryMatchGame() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState<number>(0);

  useEffect(() => {
    initDeck();
  }, []);

  const initDeck = () => {
    const deck: CardItem[] = [...CARDS_DATA, ...CARDS_DATA].map((item, idx) => ({
      id: idx,
      symbol: item.symbol,
      word: item.word,
      isFlipped: false,
      isMatched: false
    }));

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchesCount(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    playTone(450 + index * 30, 'sine', 0.1);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (cards[idx1].word === cards[idx2].word) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === idx1 || i === idx2 ? { ...c, isMatched: true } : c))
          );
          setFlippedIndices([]);
          setMatchesCount((prev) => prev + 1);
          playTone(880, 'sine', 0.3);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === idx1 || i === idx2 ? { ...c, isFlipped: false } : c))
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900">Empathy Memory Match</h3>
          <p className="text-xs text-slate-500 font-medium">Match positive emotion cards to unveil peaceful affirmations.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-black border border-teal-200">
            ✨ Matches: {matchesCount} / 6
          </span>
          <button
            onClick={initDeck}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Restart Game
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`h-28 rounded-2xl font-black text-sm transition-all duration-300 transform flex flex-col items-center justify-center p-2 cursor-pointer border-2 ${
              card.isMatched
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 scale-95 opacity-80'
                : card.isFlipped
                ? 'bg-white border-purple-400 text-purple-900 shadow-lg scale-105'
                : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500 text-white shadow-md hover:scale-102'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <>
                <span className="text-2xl mb-1">{card.symbol}</span>
                <span className="text-xs font-black">{card.word}</span>
              </>
            ) : (
              <span className="text-2xl font-black opacity-60">✨</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 4: ZEN BUBBLE POP (Clean steady colors, no flicker, no harsh dim)
// -------------------------------------------------------------
function ZenBubblePopGame() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; color: string; popped: boolean }>>(() => {
    const colors = [
      'from-purple-400 to-pink-500',
      'from-cyan-400 to-blue-500',
      'from-teal-400 to-emerald-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500'
    ];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      popped: false
    }));
  });

  const [popCount, setPopCount] = useState<number>(0);

  const handlePop = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    setPopCount((prev) => prev + 1);
    playTone(400 + Math.random() * 300, 'sine', 0.1);
  };

  const handleResetBubbles = () => {
    setBubbles((prev) => prev.map((b) => ({ ...b, popped: false })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900">Zen Bubble Pop</h3>
          <p className="text-xs text-slate-500 font-medium">Pop colorful bubbles to release tension and focus your mind.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-black border border-purple-200">
            🎈 {popCount} Popped
          </span>
          <button
            onClick={handleResetBubbles}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Reset Board
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => handlePop(b.id)}
            disabled={b.popped}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer relative overflow-hidden ${
              b.popped
                ? 'scale-90 bg-slate-800/80 border border-slate-600 text-slate-400 font-bold shadow-inner'
                : `bg-gradient-to-tr ${b.color} shadow-md hover:scale-105 active:scale-95 border-2 border-white/40`
            }`}
          >
            {!b.popped ? (
              <span className="w-3.5 h-3.5 rounded-full bg-white/70 absolute top-2 left-2 blur-[1px]" />
            ) : (
              <span className="text-[11px] text-purple-300 font-black">pop!</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 5: MINDFUL MANDALA COLOR GARDEN
// -------------------------------------------------------------
const PALETTE = [
  { name: 'Sky', hex: '#38bdf8' },
  { name: 'Rose', hex: '#fb7185' },
  { name: 'Mint', hex: '#34d399' },
  { name: 'Amber', hex: '#fbbf24' },
  { name: 'Lavender', hex: '#a78bfa' },
  { name: 'Teal', hex: '#2dd4bf' }
];

function MindfulMandalaGame() {
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[0].hex);
  const [segmentColors, setSegmentColors] = useState<Record<number, string>>({});

  const handleColorSegment = (id: number) => {
    setSegmentColors((prev) => ({ ...prev, [id]: selectedColor }));
    playTone(500 + id * 20, 'sine', 0.12);
  };

  const handleReset = () => {
    setSegmentColors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900">Mindful Mandala Garden</h3>
          <p className="text-xs text-slate-500 font-medium">Tap geometric segments to color your peaceful mandala.</p>
        </div>

        <div className="flex items-center gap-2">
          {PALETTE.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedColor(p.hex)}
              className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                selectedColor === p.hex ? 'scale-125 border-slate-900 shadow-md' : 'border-white hover:scale-110'
              }`}
              style={{ backgroundColor: p.hex }}
              title={p.name}
            />
          ))}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer ml-2"
            title="Reset Colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 300 300" className="w-64 h-64 sm:w-80 sm:h-80 drop-shadow-md">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <path
              key={`petal-${idx}`}
              d="M150 150 Q180 80 150 30 Q120 80 150 150 Z"
              transform={`rotate(${angle} 150 150)`}
              fill={segmentColors[idx] || '#f1f5f9'}
              stroke="#cbd5e1"
              strokeWidth="2"
              onClick={() => handleColorSegment(idx)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}

          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, idx) => (
            <path
              key={`inner-${idx}`}
              d="M150 150 Q170 100 150 70 Q130 100 150 150 Z"
              transform={`rotate(${angle} 150 150)`}
              fill={segmentColors[10 + idx] || '#e2e8f0'}
              stroke="#cbd5e1"
              strokeWidth="2"
              onClick={() => handleColorSegment(10 + idx)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}

          <circle
            cx="150"
            cy="150"
            r="35"
            fill={segmentColors[99] || '#f8fafc'}
            stroke="#94a3b8"
            strokeWidth="3"
            onClick={() => handleColorSegment(99)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </svg>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 6: FOLLOW THE BEAT (Rhythm Music Exercises)
// -------------------------------------------------------------
interface NotePad {
  id: number;
  label: string;
  noteName: string;
  freq: number;
  color: string;
  glowColor: string;
}

const BEAT_PADS: NotePad[] = [
  { id: 0, label: 'Bass', noteName: 'C4', freq: 261.63, color: 'bg-indigo-600 border-indigo-400 text-white', glowColor: 'shadow-indigo-500/80 ring-4 ring-indigo-300' },
  { id: 1, label: 'Bell', noteName: 'D4', freq: 293.66, color: 'bg-teal-600 border-teal-400 text-white', glowColor: 'shadow-teal-500/80 ring-4 ring-teal-300' },
  { id: 2, label: 'Chime', noteName: 'E4', freq: 329.63, color: 'bg-emerald-600 border-emerald-400 text-white', glowColor: 'shadow-emerald-500/80 ring-4 ring-emerald-300' },
  { id: 3, label: 'Celestial', noteName: 'G4', freq: 392.00, color: 'bg-amber-600 border-amber-400 text-white', glowColor: 'shadow-amber-500/80 ring-4 ring-amber-300' },
  { id: 4, label: 'Lotus', noteName: 'A4', freq: 440.00, color: 'bg-rose-600 border-rose-400 text-white', glowColor: 'shadow-rose-500/80 ring-4 ring-rose-300' },
  { id: 5, label: 'Sparkle', noteName: 'C5', freq: 523.25, color: 'bg-purple-600 border-purple-400 text-white', glowColor: 'shadow-purple-500/80 ring-4 ring-purple-300' }
];

function FollowTheBeatRhythmGame() {
  const [bpm, setBpm] = useState<number>(75);
  const [isPlayingBeat, setIsPlayingBeat] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);

  // Pattern exercise state
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("Tap 'Start Exercise' to listen and repeat the rhythm!");

  // Rhythm Metronome loop
  useEffect(() => {
    let interval: any = null;
    if (isPlayingBeat) {
      const ms = (60 / bpm) * 1000;
      interval = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % 4;
          playTone(next === 0 ? 800 : 400, 'sine', 0.05);
          return next;
        });
      }, ms);
    }
    return () => clearInterval(interval);
  }, [isPlayingBeat, bpm]);

  const generateNewSequence = () => {
    const len = 3 + Math.min(3, Math.floor(score / 30));
    const newSeq: number[] = [];
    for (let i = 0; i < len; i++) {
      newSeq.push(Math.floor(Math.random() * BEAT_PADS.length));
    }
    setSequence(newSeq);
    setUserStep(0);
    playSequence(newSeq);
  };

  const playSequence = (seqToPlay: number[] = sequence) => {
    if (seqToPlay.length === 0) return;
    setIsPlayingSequence(true);
    setFeedback("🎧 Listen carefully to the rhythm pattern...");

    seqToPlay.forEach((padIdx, i) => {
      setTimeout(() => {
        const pad = BEAT_PADS[padIdx];
        setActivePad(padIdx);
        playTone(pad.freq, 'sine', 0.3);

        setTimeout(() => {
          setActivePad(null);
        }, 300);

        if (i === seqToPlay.length - 1) {
          setTimeout(() => {
            setIsPlayingSequence(false);
            setFeedback("👉 Your turn! Tap the pads in the same rhythm sequence.");
          }, 400);
        }
      }, i * 600);
    });
  };

  const handlePadTap = (padIdx: number) => {
    const pad = BEAT_PADS[padIdx];
    playTone(pad.freq, 'sine', 0.25);
    setActivePad(padIdx);
    setTimeout(() => setActivePad(null), 200);

    if (sequence.length > 0 && !isPlayingSequence) {
      if (sequence[userStep] === padIdx) {
        const nextStep = userStep + 1;
        setUserStep(nextStep);

        if (nextStep === sequence.length) {
          playTone(1046.50, 'triangle', 0.4);
          setScore((s) => s + 10);
          setStreak((st) => st + 1);
          setFeedback("✨ Perfect Rhythm Match! Generating next beat sequence...");
          setTimeout(() => {
            generateNewSequence();
          }, 1200);
        } else {
          setFeedback(`🎵 Beat ${nextStep} of ${sequence.length} hit! Keep going...`);
        }
      } else {
        playTone(200, 'sawtooth', 0.3);
        setStreak(0);
        setFeedback("❌ Beat missed! Tap 'Listen Again' or 'Next Pattern'.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-600" />
            <span>Follow the Beat: Rhythm Music Exercises</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Listen to melodious beat sequences and repeat them to improve rhythm coordination and mental focus.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-black border border-purple-200">
            🏆 Score: {score}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
            🔥 Streak: {streak}
          </span>
        </div>
      </div>

      {/* Main Beat Stage */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-6 shadow-xl relative overflow-hidden">
        {/* Metronome Beat Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlayingBeat(!isPlayingBeat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                isPlayingBeat ? 'bg-rose-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlayingBeat ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingBeat ? 'Stop Pulse' : 'Start Metronome Pulse'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    isPlayingBeat && activeStep === step
                      ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-medium">Tempo BPM:</span>
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              {[60, 75, 90].map((val) => (
                <button
                  key={val}
                  onClick={() => setBpm(val)}
                  className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                    bpm === val ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Display */}
        <div className="text-center p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/80 text-purple-200 text-xs font-black shadow-inner">
          {feedback}
        </div>

        {/* Rhythm Pads Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {BEAT_PADS.map((pad) => {
            const isGlowing = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadTap(pad.id)}
                disabled={isPlayingSequence}
                className={`h-28 sm:h-32 rounded-3xl p-4 border-2 font-black text-left flex flex-col justify-between transition-all duration-150 transform cursor-pointer ${pad.color} ${
                  isGlowing ? `${pad.glowColor} scale-105 opacity-100` : 'opacity-85 hover:opacity-100 hover:scale-102'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs tracking-wider uppercase opacity-80">{pad.noteName}</span>
                  <Music className="w-4 h-4 opacity-70" />
                </div>
                <div>
                  <span className="text-base sm:text-lg block font-black">{pad.label}</span>
                  <span className="text-[10px] opacity-75">Tap Note Pad</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={generateNewSequence}
            disabled={isPlayingSequence}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-black shadow-lg cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{sequence.length === 0 ? 'Start Rhythm Exercise' : 'Next Beat Pattern'}</span>
          </button>

          {sequence.length > 0 && (
            <button
              onClick={() => playSequence()}
              disabled={isPlayingSequence}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Listen Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function SafeSpaceGamesModule({
  onBackToDashboard
}: {
  onBackToDashboard?: () => void;
}) {
  const [activeGame, setActiveGame] = useState<GameTab>('growing-plants');

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-black shadow-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Anti-Stress Arcade
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SafeSpace Games</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
          🌿 Relaxing & Anti-Anxiety Mini Games
        </span>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveGame('growing-plants')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'growing-plants'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">🌱</span>
          <span className="text-xs font-black block truncate">Growing Plants</span>
          <span className="text-[10px] opacity-75 truncate block">Botanical Sim</span>
        </button>

        <button
          onClick={() => setActiveGame('care-pet')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'care-pet'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">🐾</span>
          <span className="text-xs font-black block truncate">Care a Pet</span>
          <span className="text-[10px] opacity-75 truncate block">Pet Sanctuary</span>
        </button>

        <button
          onClick={() => setActiveGame('memory-match')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'memory-match'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">✨</span>
          <span className="text-xs font-black block truncate">Memory Match</span>
          <span className="text-[10px] opacity-75 truncate block">Empathy Cards</span>
        </button>

        <button
          onClick={() => setActiveGame('bubble-pop')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'bubble-pop'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">🎈</span>
          <span className="text-xs font-black block truncate">Zen Bubble Pop</span>
          <span className="text-[10px] opacity-75 truncate block">Steady Popping</span>
        </button>

        <button
          onClick={() => setActiveGame('mandala-color')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'mandala-color'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">🎨</span>
          <span className="text-xs font-black block truncate">Mandala Color</span>
          <span className="text-[10px] opacity-75 truncate block">Mindful Art</span>
        </button>

        <button
          onClick={() => setActiveGame('follow-beat')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGame === 'follow-beat'
              ? 'bg-purple-900 text-white border-purple-700 shadow-md scale-102'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xl block mb-1">🎵</span>
          <span className="text-xs font-black block truncate">Follow the Beat</span>
          <span className="text-[10px] opacity-75 truncate block">Rhythm Music</span>
        </button>
      </div>

      {/* Render Active Game */}
      {activeGame === 'growing-plants' && <ZenPlantGardenGame />}
      {activeGame === 'care-pet' && <VirtualPetCareGame />}
      {activeGame === 'memory-match' && <EmpathyMemoryMatchGame />}
      {activeGame === 'bubble-pop' && <ZenBubblePopGame />}
      {activeGame === 'mandala-color' && <MindfulMandalaGame />}
      {activeGame === 'follow-beat' && <FollowTheBeatRhythmGame />}
    </div>
  );
}
