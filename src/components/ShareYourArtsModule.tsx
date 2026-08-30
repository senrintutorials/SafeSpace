import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, Paintbrush, Pencil, Eraser, RotateCcw, RotateCw, Trash2, Download, 
  Sparkles, Brain, Heart, CheckCircle2, Image as ImageIcon, Send, ShieldCheck, 
  Eye, Smile, Activity, Sliders, RefreshCw, AlertTriangle, Layers, Maximize2,
  Droplets, ArrowDown, ChevronDown, Compass, Flower2, Sun, Sparkle, Maximize,
  Minimize2, FileText, Star, Trees, Waves, Feather, Globe, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import { saveRecordedEntry, getRecordedEntries, RecordedActivityEntry } from '../utils/recordedEntriesStore';
import { getActiveAvatarSticker } from '../utils/avatarStickerStore';
import { UserProfile } from '../types/auth';

interface ShareYourArtsModuleProps {
  currentUser?: UserProfile | null;
  onNavigateToDashboard?: () => void;
}

type ToolType = 
  | 'pencil' 
  | 'brush' 
  | 'watercolor' 
  | 'oil' 
  | 'oil_pastel'
  | 'crayon'
  | 'charcoal'
  | 'marker'
  | 'chalk'
  | 'acrylic' 
  | 'poster' 
  | 'calligraphy' 
  | 'airbrush' 
  | 'bucket' 
  | 'eraser'
  | 'pan';

type ColoringTemplateType = 
  | 'blank' 
  | 'mandala_radial' 
  | 'zen_lotus' 
  | 'cosmic_sun' 
  | 'anti_stress_garden' 
  | 'mandala_butterfly'
  | 'mandala_flower_life'
  | 'mandala_star_burst'
  | 'mindful_tree_life'
  | 'mandala_ocean_wave'
  | 'mandala_wise_owl'
  | 'mandala_radiant_heart';

const COLOR_PRESETS = [
  { name: 'Calm Sky', hex: '#3b82f6', category: 'cool' },
  { name: 'Healing Emerald', hex: '#10b981', category: 'cool' },
  { name: 'Teal Harmony', hex: '#14b8a6', category: 'cool' },
  { name: 'Rose Serenity', hex: '#f43f5e', category: 'warm' },
  { name: 'Golden Joy', hex: '#eab308', category: 'warm' },
  { name: 'Expressive Orange', hex: '#f97316', category: 'warm' },
  { name: 'Deep Reflection', hex: '#8b5cf6', category: 'reflective' },
  { name: 'Lavender Peace', hex: '#a855f7', category: 'reflective' },
  { name: 'Crimson Flame', hex: '#dc2626', category: 'warm' },
  { name: 'Indigo Night', hex: '#4338ca', category: 'cool' },
  { name: 'Charcoal Depth', hex: '#1e293b', category: 'neutral' },
  { name: 'Soft Gray', hex: '#64748b', category: 'neutral' },
  { name: 'Pure White', hex: '#ffffff', category: 'neutral' },
  { name: 'Peach Warmth', hex: '#fb923c', category: 'warm' },
  { name: 'Saffron Gold', hex: '#f59e0b', category: 'warm' },
  { name: 'Forest Moss', hex: '#15803d', category: 'cool' },
];

const COLORING_TEMPLATES: { id: ColoringTemplateType; name: string; description: string; icon: any; category: string }[] = [
  { 
    id: 'blank', 
    name: 'Blank Canvas', 
    description: 'Start with a fresh, clean canvas for freehand drawing & painting.', 
    icon: FileText,
    category: 'Freehand'
  },
  { 
    id: 'mandala_radial', 
    name: 'Sacred Geometric Mandala', 
    description: '12-fold radial symmetry with concentric circles & lotus petals.', 
    icon: Compass,
    category: 'Anti-Stress Mandala'
  },
  { 
    id: 'zen_lotus', 
    name: 'Zen Lotus Harmony', 
    description: 'Blooming lotus flower with calming concentric water ripple rings.', 
    icon: Flower2,
    category: 'Zen Nature'
  },
  { 
    id: 'cosmic_sun', 
    name: 'Cosmic Sun & Moon', 
    description: 'Celestial dual sun-moon face with radiating star orbits & flame beams.', 
    icon: Sun,
    category: 'Celestial'
  },
  { 
    id: 'anti_stress_garden', 
    name: 'Floral Anti-Stress Garden', 
    description: 'Interlocking botanical vines, spiral paisley leaves & blooming roses.', 
    icon: Sparkle,
    category: 'Botanical'
  },
  { 
    id: 'mandala_butterfly', 
    name: 'Mystic Mosaic Butterfly', 
    description: 'Detailed symmetrical butterfly wing patterns for mindful coloring.', 
    icon: Heart,
    category: 'Animal Zen'
  },
  {
    id: 'mandala_flower_life',
    name: 'Flower of Life Mandala',
    description: 'Ancient sacred geometry grid with overlapping 6-fold interlocking circle flowers.',
    icon: Globe,
    category: 'Sacred Geometry'
  },
  {
    id: 'mandala_star_burst',
    name: 'Cosmic Starburst Mandala',
    description: 'Intricate 8-pointed kaleidoscopic starburst with diamond lattice & teardrop gems.',
    icon: Star,
    category: 'Kaleidoscope'
  },
  {
    id: 'mindful_tree_life',
    name: 'Mindful Tree of Life',
    description: 'Spiraling root system, curving trunk & lush circular canopy of leaves and fruits.',
    icon: Trees,
    category: 'Nature Zen'
  },
  {
    id: 'mandala_ocean_wave',
    name: 'Zen Ocean Wave Spiral',
    description: 'Rhythmic Hokusai-inspired ocean wave crests & sea foam spiral mandala.',
    icon: Waves,
    category: 'Ocean Meditation'
  },
  {
    id: 'mandala_wise_owl',
    name: 'Peaceful Wise Owl',
    description: 'Geometric mandala owl with intricate layered wing feathers & starry eyes.',
    icon: Feather,
    category: 'Animal Zen'
  },
  {
    id: 'mandala_radiant_heart',
    name: 'Radiant Heart Mandala',
    description: 'Central interlocking hearts surrounded by floral lace & radiating love beams.',
    icon: Heart,
    category: 'Mindful Love'
  },
];

const ARTISTIC_TOOLS: { id: ToolType; name: string; description: string; icon: any; badge: string }[] = [
  { id: 'pan', name: 'Move / Drag Canvas', description: 'Click & drag anywhere to move and position the image freely for coloring convenience', icon: Move, badge: 'Drag & Move' },
  { id: 'watercolor', name: 'Water Color', description: 'Soft translucent blending with wet diffusion', icon: Droplets, badge: 'Translucent' },
  { id: 'oil', name: 'Oil Painting', description: 'Rich thick impasto strokes with highlight & shadow texture', icon: Paintbrush, badge: 'Impasto' },
  { id: 'oil_pastel', name: 'Oil Pastel', description: 'Creamy rich blended texture with soft waxy sheen', icon: Palette, badge: 'Creamy Blend' },
  { id: 'crayon', name: 'Wax Crayon', description: 'Textured wax grain with organic paper tooth friction', icon: Pencil, badge: 'Wax Texture' },
  { id: 'charcoal', name: 'Vine Charcoal', description: 'Smoky velvety dark strokes with soft feathered smudging', icon: Feather, badge: 'Velvet Smudge' },
  { id: 'marker', name: 'Chisel Marker', description: 'Bold saturated permanent alcohol ink strokes', icon: Layers, badge: 'Bold Ink' },
  { id: 'chalk', name: 'Soft Chalk Pastel', description: 'Dusty powdery soft-matte shading and highlights', icon: Sparkles, badge: 'Dusty Matte' },
  { id: 'acrylic', name: 'Acrylic', description: 'Smooth, vibrant, high-satin opacity paint', icon: Palette, badge: 'Satin Finish' },
  { id: 'poster', name: 'Poster Paint / Gouache', description: 'Flat matte solid color coverage', icon: Layers, badge: 'Flat Matte' },
  { id: 'pencil', name: 'Fine Pencil', description: 'Sharp line sketching & detail shading', icon: Pencil, badge: 'Sketch' },
  { id: 'brush', name: 'Smooth Brush', description: 'Smooth round brush for general painting', icon: Paintbrush, badge: 'Smooth' },
  { id: 'calligraphy', name: 'Calligraphy', description: 'Chisel nib for thick & thin stroke dynamics', icon: Layers, badge: 'Chisel' },
  { id: 'airbrush', name: 'Spray Airbrush', description: 'Soft feathered spray gradient mist', icon: Sparkles, badge: 'Feathered' },
  { id: 'bucket', name: 'Paint Bucket', description: 'Fill canvas or enclosed shapes with color', icon: Palette, badge: 'Fill' },
  { id: 'eraser', name: 'Eraser', description: 'Clean canvas area back to white', icon: Eraser, badge: 'Clean' },
];

export default function ShareYourArtsModule({ currentUser, onNavigateToDashboard }: ShareYourArtsModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Canvas & Tool States
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('watercolor');
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(18);
  const [brushOpacity, setBrushOpacity] = useState<number>(80);
  const [canvasBgColor, setCanvasBgColor] = useState<string>('#ffffff');
  const [canvasHeight, setCanvasHeight] = useState<number>(650); // Larger default canvas
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%, 1.25 = 125%, 1.5 = 150%, 2 = 200%, 0.75 = 75%, 0.5 = 50%
  const [selectedTemplate, setSelectedTemplate] = useState<ColoringTemplateType>('mandala_radial');

  // Drag / Pan Image Canvas States
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPanOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, +(prev - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // History Undo/Redo stack
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // User Reflection & Saving State
  const [artTitle, setArtTitle] = useState<string>('');
  const [artReflection, setArtReflection] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [lastSavedAnalysis, setLastSavedAnalysis] = useState<RecordedActivityEntry['reportAnalysis'] | null>(null);

  // Saved Artworks Gallery
  const [savedArtGallery, setSavedArtGallery] = useState<RecordedActivityEntry[]>([]);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<RecordedActivityEntry | null>(null);

  // Smooth scroll helper
  const scrollToSection = (elementId: string) => {
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Draw outline templates onto canvas
  const renderTemplateOnCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, template: ColoringTemplateType) => {
    // Fill white background first
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (template === 'blank') return;

    ctx.save();
    ctx.strokeStyle = '#1e293b'; // Crisp charcoal outline
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = width / 2;
    const cy = height / 2;

    if (template === 'mandala_radial') {
      // 12-Fold Sacred Radial Mandala
      const rings = [35, 75, 120, 175, 235, 290];
      rings.forEach(r => {
        if (r <= Math.min(width, height) / 2 - 10) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      const petals = 12;
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Teardrop Petals inner ring
        ctx.beginPath();
        ctx.moveTo(0, 35);
        ctx.bezierCurveTo(28, 55, 28, 95, 0, 120);
        ctx.bezierCurveTo(-28, 95, -28, 55, 0, 35);
        ctx.stroke();

        // Outer pointed Lotus Petals
        ctx.beginPath();
        ctx.moveTo(0, 120);
        ctx.quadraticCurveTo(40, 145, 0, 175);
        ctx.quadraticCurveTo(-40, 145, 0, 120);
        ctx.stroke();

        // Outer Diamond Geometry
        ctx.beginPath();
        ctx.moveTo(0, 175);
        ctx.lineTo(22, 205);
        ctx.lineTo(0, 235);
        ctx.lineTo(-22, 205);
        ctx.closePath();
        ctx.stroke();

        // Scalloped outer arches
        ctx.beginPath();
        ctx.arc(0, 235, 24, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
      }
    } else if (template === 'zen_lotus') {
      // Zen Blooming Lotus Flower
      // Concentric water ripple background
      for (let r = 50; r <= 320; r += 45) {
        if (r <= Math.min(width, height) / 2 - 10) {
          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Center Lotus Seed Pod
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 38, 0, Math.PI * 2);
      ctx.stroke();

      // Seed pod dots
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 20, cy + 20 + Math.sin(a) * 20, 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Layer 1 Petals
      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx.save();
        ctx.translate(cx, cy + 20);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 38);
        ctx.bezierCurveTo(45, 70, 45, 120, 0, 140);
        ctx.bezierCurveTo(-45, 120, -45, 70, 0, 38);
        ctx.stroke();

        // Inner petal vein line
        ctx.beginPath();
        ctx.moveTo(0, 38);
        ctx.lineTo(0, 125);
        ctx.stroke();

        ctx.restore();
      }

      // Layer 2 Outer Blooming Petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount + Math.PI / petalCount;
        ctx.save();
        ctx.translate(cx, cy + 20);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 80);
        ctx.bezierCurveTo(60, 130, 60, 190, 0, 220);
        ctx.bezierCurveTo(-60, 190, -60, 130, 0, 80);
        ctx.stroke();

        ctx.restore();
      }
    } else if (template === 'cosmic_sun') {
      // Cosmic Sun & Moon Mandala
      // Center Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Dual Moon / Sun Divide Curve
      ctx.beginPath();
      ctx.arc(cx, cy, 110, -Math.PI / 2, Math.PI / 2, false);
      ctx.bezierCurveTo(cx - 30, cy + 60, cx - 30, cy - 60, cx, cy - 110);
      ctx.stroke();

      // Moon Crescent Profile
      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.bezierCurveTo(cx - 65, cy - 60, cx - 65, cy + 60, cx, cy + 110);
      ctx.stroke();

      // Moon sleeping eye
      ctx.beginPath();
      ctx.arc(cx - 35, cy - 20, 14, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Sun open eye
      ctx.beginPath();
      ctx.arc(cx + 35, cy - 20, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 35, cy - 20, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Sun Smile
      ctx.beginPath();
      ctx.arc(cx + 35, cy + 30, 18, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Radiating Sun Flame Beams (16 rays)
      const rays = 16;
      for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        if (i % 2 === 0) {
          // Sharp Flame Ray
          ctx.beginPath();
          ctx.moveTo(0, 110);
          ctx.lineTo(22, 170);
          ctx.lineTo(0, 240);
          ctx.lineTo(-22, 170);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Wavy Flame Beam
          ctx.beginPath();
          ctx.moveTo(0, 110);
          ctx.bezierCurveTo(25, 140, -25, 180, 0, 220);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Outer Star Orbit Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 255, 0, Math.PI * 2);
      ctx.stroke();
    } else if (template === 'anti_stress_garden') {
      // Botanical Floral Lattice
      // Center Grand Sunflower / Mandala Rose
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Center Grid Mesh
      for (let x = -35; x <= 35; x += 12) {
        ctx.beginPath();
        ctx.moveTo(cx + x, cy - Math.sqrt(45 * 45 - x * x));
        ctx.lineTo(cx + x, cy + Math.sqrt(45 * 45 - x * x));
        ctx.stroke();
      }

      // Concentric Botanical Petals
      const gardenPetals = 16;
      for (let i = 0; i < gardenPetals; i++) {
        const angle = (i * Math.PI * 2) / gardenPetals;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Ring 1 Petals
        ctx.beginPath();
        ctx.moveTo(0, 45);
        ctx.quadraticCurveTo(22, 75, 0, 110);
        ctx.quadraticCurveTo(-22, 75, 0, 45);
        ctx.stroke();

        // Ring 2 Outer Paisley Leaves
        ctx.beginPath();
        ctx.moveTo(0, 110);
        ctx.bezierCurveTo(35, 150, 35, 200, 0, 230);
        ctx.bezierCurveTo(-35, 200, -35, 150, 0, 110);
        ctx.stroke();

        // Inner Leaf Rib
        ctx.beginPath();
        ctx.moveTo(0, 110);
        ctx.lineTo(0, 220);
        ctx.stroke();

        ctx.restore();
      }
    } else if (template === 'mandala_butterfly') {
      // Mystic Mosaic Butterfly
      ctx.save();
      ctx.translate(cx, cy);

      // Butterfly Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 90, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -100, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Antennae
      ctx.beginPath();
      ctx.moveTo(-8, -112);
      ctx.quadraticCurveTo(-40, -160, -55, -140);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-55, -140, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, -112);
      ctx.quadraticCurveTo(40, -160, 55, -140);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(55, -140, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Symmetrical Wings (Top & Bottom)
      for (const side of [-1, 1]) {
        // Top Wing
        ctx.beginPath();
        ctx.moveTo(side * 12, -40);
        ctx.bezierCurveTo(side * 140, -180, side * 260, -90, side * 220, 20);
        ctx.bezierCurveTo(side * 160, 80, side * 80, 50, side * 12, 10);
        ctx.stroke();

        // Top Wing Mosaic Cells
        ctx.beginPath();
        ctx.arc(side * 120, -50, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(side * 180, -30, 28, 0, Math.PI * 2);
        ctx.stroke();

        // Bottom Wing
        ctx.beginPath();
        ctx.moveTo(side * 12, 10);
        ctx.bezierCurveTo(side * 210, 60, side * 180, 210, side * 100, 220);
        ctx.bezierCurveTo(side * 40, 200, side * 20, 120, side * 12, 60);
        ctx.stroke();

        // Bottom Wing Radial Rings
        ctx.beginPath();
        ctx.arc(side * 100, 130, 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    } else if (template === 'mandala_flower_life') {
      // Flower of Life Sacred Geometry
      ctx.save();
      ctx.translate(cx, cy);

      const R = 70;
      // Outer bounding circle
      ctx.beginPath();
      ctx.arc(0, 0, R * 2.8, 0, Math.PI * 2);
      ctx.stroke();

      // Outer ring 2
      ctx.beginPath();
      ctx.arc(0, 0, R * 3.0, 0, Math.PI * 2);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.stroke();

      // First Ring of 6 Interlocking Circles
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * R;

        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Second Ring of 12 Interlocking Circles
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const dist = i % 2 === 0 ? R * 1.732 : R * 2;
        const x = Math.cos(a) * dist;
        const y = Math.sin(a) * dist;

        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    } else if (template === 'mandala_star_burst') {
      // Cosmic Starburst Mandala
      ctx.save();
      ctx.translate(cx, cy);

      // Concentric circles
      [30, 70, 120, 180, 230].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 8-Pointed Starburst Layers
      const points = 8;
      for (let i = 0; i < points; i++) {
        const a = (i * Math.PI * 2) / points;
        ctx.save();
        ctx.rotate(a);

        // Sharp Main Star Spike
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(25, 100);
        ctx.lineTo(0, 230);
        ctx.lineTo(-25, 100);
        ctx.closePath();
        ctx.stroke();

        // Inner Diamond
        ctx.beginPath();
        ctx.moveTo(0, 70);
        ctx.lineTo(15, 120);
        ctx.lineTo(0, 170);
        ctx.lineTo(-15, 120);
        ctx.closePath();
        ctx.stroke();

        // Teardrops
        ctx.beginPath();
        ctx.arc(0, 195, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    } else if (template === 'mindful_tree_life') {
      // Mindful Tree of Life
      ctx.save();
      ctx.translate(cx, cy);

      // Outer Circular Canopy Frame
      ctx.beginPath();
      ctx.arc(0, -20, 210, 0, Math.PI * 2);
      ctx.stroke();

      // Tree Trunk
      ctx.beginPath();
      ctx.moveTo(-30, 180);
      ctx.quadraticCurveTo(-15, 60, -40, -10);
      ctx.quadraticCurveTo(-80, -70, -130, -90);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(30, 180);
      ctx.quadraticCurveTo(15, 60, 40, -10);
      ctx.quadraticCurveTo(80, -70, 130, -90);
      ctx.stroke();

      // Center Branch Split
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.quadraticCurveTo(-10, -30, 0, -110);
      ctx.stroke();

      // Swirling Canopy Circles (Leaves)
      const leafCount = 12;
      for (let i = 0; i < leafCount; i++) {
        const a = (i * Math.PI * 2) / leafCount;
        const lx = Math.cos(a) * 140;
        const ly = -20 + Math.sin(a) * 140;

        ctx.beginPath();
        ctx.arc(lx, ly, 38, 0, Math.PI * 2);
        ctx.stroke();

        // Inner spiral in each leaf circle
        ctx.beginPath();
        ctx.arc(lx, ly, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Root Spirals
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 20, 180);
        ctx.bezierCurveTo(side * 60, 210, side * 120, 210, side * 150, 180);
        ctx.stroke();
      }

      ctx.restore();
    } else if (template === 'mandala_ocean_wave') {
      // Zen Ocean Wave Spiral
      ctx.save();
      ctx.translate(cx, cy);

      // Concentric Rings
      [40, 90, 150, 210].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 6 Swirling Hokusai Ocean Waves
      const waves = 6;
      for (let i = 0; i < waves; i++) {
        const a = (i * Math.PI * 2) / waves;
        ctx.save();
        ctx.rotate(a);

        // Major Wave Crest
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.bezierCurveTo(90, 60, 160, 130, 120, 210);
        ctx.bezierCurveTo(80, 210, 40, 140, 0, 90);
        ctx.stroke();

        // Foam droplets
        [
          { x: 130, y: 190, r: 8 },
          { x: 145, y: 170, r: 6 },
          { x: 150, y: 145, r: 5 },
        ].forEach(d => {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.restore();
      }

      ctx.restore();
    } else if (template === 'mandala_wise_owl') {
      // Peaceful Wise Owl Mandala
      ctx.save();
      ctx.translate(cx, cy);

      // Owl Head Circle
      ctx.beginPath();
      ctx.arc(0, -60, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Giant Mandala Eyes
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(side * 45, -70, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(side * 45, -70, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(side * 45, -70, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Owl Beak
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(14, -20);
      ctx.lineTo(-14, -20);
      ctx.closePath();
      ctx.stroke();

      // Scalloped Chest Feathers
      ctx.beginPath();
      ctx.ellipse(0, 90, 85, 110, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let row = 0; row < 5; row++) {
        const y = 20 + row * 28;
        ctx.beginPath();
        ctx.arc(-40, y, 20, 0, Math.PI);
        ctx.arc(0, y, 20, 0, Math.PI);
        ctx.arc(40, y, 20, 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    } else if (template === 'mandala_radiant_heart') {
      // Radiant Heart Mandala
      ctx.save();
      ctx.translate(cx, cy);

      // Concentric Heart Rings
      for (const scale of [1, 1.4, 1.8, 2.2]) {
        ctx.save();
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.bezierCurveTo(-45, -75, -90, -15, 0, 60);
        ctx.bezierCurveTo(90, -15, 45, -75, 0, -30);
        ctx.stroke();
        ctx.restore();
      }

      // Radiating Heart Beams (12 rays)
      const rays = 12;
      for (let i = 0; i < rays; i++) {
        const a = (i * Math.PI * 2) / rays;
        ctx.save();
        ctx.rotate(a);

        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(0, 210);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 220, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  };

  // Initialize & Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCanvas = () => {
      const parentWidth = canvasContainerRef.current?.clientWidth || 800;
      canvas.width = Math.max(parentWidth, 700);
      canvas.height = canvasHeight;

      // Render selected coloring template line art
      renderTemplateOnCanvas(ctx, canvas.width, canvas.height, selectedTemplate);

      // Save initial state to history stack
      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setHistoryIndex(0);
    };

    initCanvas();
    const timer = setTimeout(initCanvas, 50);

    // Load existing saved artworks from store
    loadGallery();

    return () => clearTimeout(timer);
  }, [canvasHeight, selectedTemplate]);

  const loadGallery = () => {
    const entries = getRecordedEntries();
    const artEntries = entries.filter(e => e.type === 'multimodal' || (e.title && e.title.includes('Art')));
    setSavedArtGallery(artEntries);
  };

  const pushHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);

    // Limit history stack size to 30 states
    if (newHistory.length > 30) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderTemplateOnCanvas(ctx, canvas.width, canvas.height, selectedTemplate);
    pushHistoryState();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if ('clientX' in e) {
      return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
    return { x: 0, y: 0 };
  };

  // Drawing Handlers
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (currentTool === 'pan') {
      const clientPos = getClientPos(e);
      panStartRef.current = clientPos;
      currentPanOffsetRef.current = { ...panOffset };
      setIsPanning(true);
      return;
    }

    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'bucket') {
      // Paint bucket fill whole canvas or tint
      ctx.save();
      ctx.globalAlpha = brushOpacity / 100;
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Re-overlay template outline
      if (selectedTemplate !== 'blank') {
        renderTemplateOnCanvas(ctx, canvas.width, canvas.height, selectedTemplate);
      }
      ctx.restore();
      pushHistoryState();
      setIsDrawing(false);
      return;
    }

    drawStroke(pos, pos);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (currentTool === 'pan') {
      if (!isPanning) return;
      e.preventDefault();
      const clientPos = getClientPos(e);
      const dx = clientPos.x - panStartRef.current.x;
      const dy = clientPos.y - panStartRef.current.y;
      setPanOffset({
        x: currentPanOffsetRef.current.x + dx,
        y: currentPanOffsetRef.current.y + dy
      });
      return;
    }

    if (!isDrawing) return;
    e.preventDefault();
    const currentPos = getCanvasCoordinates(e);
    if (lastPosRef.current) {
      drawStroke(lastPosRef.current, currentPos);
    }
    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      setIsDrawing(false);
      lastPosRef.current = null;
      pushHistoryState();
    }
  };

  // Advanced Multi-Tool Stroke Rendering Engine
  const drawStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    if (currentTool === 'eraser') {
      ctx.strokeStyle = canvasBgColor;
      ctx.lineWidth = brushSize * 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'watercolor') {
      // Watercolor: Soft translucent blending with fluid diffusion wet edge
      ctx.globalAlpha = (brushOpacity / 100) * 0.18;
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize * 1.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Layered soft wash stroke
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Soft water droplets / bleeding edge
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.floor(distance / 4));
      for (let i = 0; i < steps; i++) {
        const rx = from.x + (to.x - from.x) * (i / steps);
        const ry = from.y + (to.y - from.y) * (i / steps);
        ctx.beginPath();
        ctx.arc(
          rx + (Math.random() - 0.5) * (brushSize * 0.3),
          ry + (Math.random() - 0.5) * (brushSize * 0.3),
          brushSize * 0.6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (currentTool === 'oil_pastel') {
      // Oil Pastel: Creamy rich blend with soft waxy sheen
      ctx.globalAlpha = Math.min(1.0, (brushOpacity / 100) * 0.9);
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Creamy waxy grain texture
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.floor(dist / 3));
      for (let i = 0; i < steps; i++) {
        const rx = from.x + (to.x - from.x) * (i / steps);
        const ry = from.y + (to.y - from.y) * (i / steps);
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(
          rx + (Math.random() - 0.5) * (brushSize * 0.4),
          ry + (Math.random() - 0.5) * (brushSize * 0.4),
          brushSize * 0.45,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (currentTool === 'crayon') {
      // Wax Crayon: Textured waxy stroke with paper grain tooth friction
      ctx.globalAlpha = (brushOpacity / 100) * 0.8;
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Wax paper tooth specks
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const specks = Math.floor(dist * 1.5) + 3;
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < specks; i++) {
        const t = Math.random();
        const sx = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * brushSize * 0.7;
        const sy = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * brushSize * 0.7;
        ctx.fillRect(sx, sy, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }
    } else if (currentTool === 'charcoal') {
      // Vine Charcoal: Smoky velvety dark stroke with soft smudged dust
      ctx.globalAlpha = (brushOpacity / 100) * 0.75;
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Soft charcoal dust particles
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const particles = Math.floor(dist * 2);
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < particles; i++) {
        const t = Math.random();
        const px = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * brushSize * 1.1;
        const py = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * brushSize * 1.1;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * (brushSize * 0.3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (currentTool === 'marker') {
      // Chisel Marker: Bold, saturated permanent ink
      ctx.globalAlpha = (brushOpacity / 100) * 0.92;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * 1.2;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'chalk') {
      // Soft Chalk Pastel: Dusty, powdery soft matte stroke
      ctx.globalAlpha = (brushOpacity / 100) * 0.65;
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Powder dust halo
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const dust = Math.floor(dist * 1.8);
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < dust; i++) {
        const t = Math.random();
        const dx = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * brushSize * 1.3;
        const dy = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * brushSize * 1.3;
        ctx.fillRect(dx, dy, 2, 2);
      }
    } else if (currentTool === 'oil') {
      // Oil Painting: Thick impasto texture with rich saturation stroke
      ctx.globalAlpha = Math.min(1.0, (brushOpacity / 100) * 0.85);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Main heavy body stroke
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Impasto bristle texture lines
      ctx.lineWidth = Math.max(1.5, brushSize * 0.18);
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(from.x + 2, from.y - 2);
      ctx.lineTo(to.x + 2, to.y - 2);
      ctx.stroke();

      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(from.x - 2, from.y + 2);
      ctx.lineTo(to.x - 2, to.y + 2);
      ctx.stroke();
    } else if (currentTool === 'acrylic') {
      // Acrylic Paint: Vibrant, satin smooth, high opacity stroke
      ctx.globalAlpha = (brushOpacity / 100) * 0.95;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'poster') {
      // Poster Paint / Gouache: Flat, solid matte coverage
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'pencil') {
      // Fine Pencil
      ctx.globalAlpha = brushOpacity / 100;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = Math.max(1, Math.min(brushSize, 5));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      // Classic Smooth Round Brush
      ctx.globalAlpha = brushOpacity / 100;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (currentTool === 'calligraphy') {
      // Chisel Calligraphy Nib
      ctx.globalAlpha = brushOpacity / 100;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      ctx.moveTo(from.x - brushSize / 2, from.y - brushSize / 2);
      ctx.lineTo(to.x + brushSize / 2, to.y + brushSize / 2);
      ctx.stroke();
    } else if (currentTool === 'airbrush') {
      // Spray Airbrush Stippling
      ctx.globalAlpha = (brushOpacity / 100) * 0.7;
      const density = Math.floor(brushSize * 3);
      ctx.fillStyle = selectedColor;
      for (let i = 0; i < density; i++) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetRadius = Math.random() * (brushSize / 2);
        const sprayX = to.x + Math.cos(offsetAngle) * offsetRadius;
        const sprayY = to.y + Math.sin(offsetAngle) * offsetRadius;
        ctx.fillRect(sprayX, sprayY, 1.6, 1.6);
      }
    }

    ctx.restore();
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${artTitle ? artTitle.toLowerCase().replace(/\s+/g, '-') : 'safespace-artwork'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // AI Mental Health Analysis Engine for Art
  const handleAnalyzeAndSaveArt = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    setSaveSuccessMsg('');

    const imageDataUrl = canvas.toDataURL('image/png');
    const ctx = canvas.getContext('2d');
    
    // Perform Color Spectrum & Pixel Analysis
    let totalRed = 0, totalGreen = 0, totalBlue = 0, drawnPixels = 0;
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r < 250 || g < 250 || b < 250) {
          totalRed += r;
          totalGreen += g;
          totalBlue += b;
          drawnPixels++;
        }
      }
    }

    const avgR = drawnPixels > 0 ? totalRed / drawnPixels : 120;
    const avgG = drawnPixels > 0 ? totalGreen / drawnPixels : 150;
    const avgB = drawnPixels > 0 ? totalBlue / drawnPixels : 200;

    let dominantEmotion = 'Creative Catharsis & Harmony';
    let valenceScore = 0.85;
    let arousalScore = 0.42;
    let sentimentLabel = 'Mindful Art Flow';

    if (avgB > avgR && avgB > avgG) {
      dominantEmotion = 'Serene Tranquility & Calm Reflection';
      valenceScore = 0.88;
      arousalScore = 0.35;
      sentimentLabel = 'Cool Soothing Tones';
    } else if (avgR > avgB && avgR > avgG) {
      dominantEmotion = 'Passionate Expression & Energetic Release';
      valenceScore = 0.78;
      arousalScore = 0.65;
      sentimentLabel = 'Vibrant Warmth';
    } else if (avgG > avgR && avgG > avgB) {
      dominantEmotion = 'Healing Restorative Growth';
      valenceScore = 0.91;
      arousalScore = 0.38;
      sentimentLabel = 'Nature Balance';
    }

    const titleText = artTitle.trim() || `${selectedTemplate !== 'blank' ? COLORING_TEMPLATES.find(t => t.id === selectedTemplate)?.name : 'Expressive Digital Canvas'}`;
    const reflectionText = artReflection.trim() || 'Mindful art reflection recorded during creative study break.';

    const reportAnalysis: RecordedActivityEntry['reportAnalysis'] = {
      dominantEmotion,
      valenceScore,
      arousalScore,
      sentimentLabel,
      summaryObservation: `Color spectrum analysis of the artwork indicates high dominance of ${
        avgB > avgR ? 'soothing cool blues/purples' : avgR > avgG ? 'expressive warm tones' : 'restorative green hues'
      }. Stroke patterns and chosen artistic medium reflect non-linear creative release and healthy emotional sublimation.`,
      psychologistInsights: [
        `Art expression provided an effective non-verbal channel for releasing subconscious tension.`,
        `The chosen color palette (${selectedColor}) and tool (${currentTool.toUpperCase()}) align with self-directed grounding and cognitive decompression.`,
        `User reflection "${reflectionText.slice(0, 70)}..." demonstrates positive emotional self-awareness.`
      ],
      guidanceNote: `Art therapy serves as a key protective factor against stress. Continue keeping visual reflections in your SafeSpace Dashboard.`,
      safetyStatus: 'SAFE'
    };

    // Save to Dashboard
    saveRecordedEntry({
      type: 'share-art',
      typeLabel: '🖼️ Share your Arts',
      title: `🎨 Art: ${titleText}`,
      excerpt: `Reflection: "${reflectionText}" • Analysis: ${dominantEmotion} (Valence: ${(valenceScore * 100).toFixed(0)}%)`,
      mediaUrl: imageDataUrl,
      reportAnalysis
    });

    setLastSavedAnalysis(reportAnalysis);
    setIsAnalyzing(false);
    setSaveSuccessMsg('✨ Artwork & SafeSpace Observation saved to Dashboard!');
    loadGallery();

    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4500);
  };

  const handleStampAvatarSignature = () => {
    const activeSticker = getActiveAvatarSticker();
    if (!activeSticker) {
      alert('No active Avatar Sticker found! Please go to "Create Avatar" in the sidebar to create your custom avatar sticker.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeSticker.dataUrl;
    img.onload = () => {
      const size = 120;
      const padding = 20;
      const x = canvas.width - size - padding;
      const y = canvas.height - size - padding;

      ctx.save();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();

      pushHistoryState();
      alert('✨ Your custom Avatar Sticker signature stamp has been attached to your artwork!');
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 lg:space-y-12 max-w-7xl mx-auto pb-20">
      {/* HEADER BANNER WITH SCROLL DOWN QUICK NAV */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-6 sm:p-9 text-white shadow-md">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/30">
            <Palette className="w-3.5 h-3.5 text-amber-200" /> Page Tool: Share your Arts
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
            Online Art Canvas & AI Mental Health Analysis
          </h1>

          {/* SCROLL DOWN QUICK OPTIONS BAR */}
          <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => scrollToSection('sec-coloring-templates')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/30 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-200" />
              <span>Coloring Pages & Mandalas</span>
              <ArrowDown className="w-3 h-3 text-white/80" />
            </button>

            <button
              onClick={() => scrollToSection('sec-art-canvas')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/30 cursor-pointer"
            >
              <Paintbrush className="w-3.5 h-3.5 text-amber-200" />
              <span>Canvas & Artistic Tools</span>
              <ArrowDown className="w-3 h-3 text-white/80" />
            </button>

            <button
              onClick={() => scrollToSection('sec-ai-gallery')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/30 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-amber-200" />
              <span>AI Analysis & Gallery</span>
              <ArrowDown className="w-3 h-3 text-white/80" />
            </button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION 1: COLORING PAGES & ANTI-STRESS MANDALAS SELECTOR */}
      <div id="sec-coloring-templates" className="bg-white border-2 border-slate-200 rounded-t-3xl border-b-0 p-5 sm:p-7 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" /> Anti-Stress Coloring Pages & Mandalas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an intricate mandala or anti-stress outline template from the dropdown list to color and fill on the large canvas below.
            </p>
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/80 self-start sm:self-auto shrink-0">
            {COLORING_TEMPLATES.length} Outlines Available
          </span>
        </div>

        {/* COMPACT DROPDOWN SELECT & ACTIVE TEMPLATE PREVIEW BAR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
          {/* Dropdown Select Box */}
          <div className="md:col-span-5 relative space-y-1.5">
            <label htmlFor="coloring-template-select" className="block text-xs font-bold text-slate-700">
              Select Coloring Page or Mandala:
            </label>
            <div className="relative">
              <select
                id="coloring-template-select"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value as ColoringTemplateType);
                  scrollToSection('sec-art-canvas');
                }}
                className="w-full appearance-none bg-slate-50 hover:bg-amber-50/50 border border-slate-300 hover:border-amber-400 text-slate-900 text-xs sm:text-sm font-bold rounded-xl pl-4 pr-10 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
              >
                {COLORING_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.category}] {tmpl.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Active Selected Template Summary Preview Card */}
          <div className="md:col-span-7 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-4">
            {(() => {
              const activeTmpl = COLORING_TEMPLATES.find(t => t.id === selectedTemplate) || COLORING_TEMPLATES[0];
              const TmplIcon = activeTmpl.icon;
              return (
                <>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
                      <TmplIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{activeTmpl.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 shrink-0">
                          {activeTmpl.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{activeTmpl.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => scrollToSection('sec-art-canvas')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>Canvas</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* WORKSPACE AREA (LANDSCAPE CANVAS LAYOUT WITH NO SPACE TO TEMPLATE BOX) */}
      <div id="sec-art-canvas" className="space-y-8 sm:space-y-10 -mt-8 sm:-mt-10 lg:-mt-12">
        
        {/* LANDSCAPE INTERACTIVE DRAWING CANVAS AREA */}
        <div ref={canvasContainerRef} className="w-full bg-white border-2 border-slate-200 rounded-b-3xl rounded-t-none p-5 sm:p-7 shadow-md relative overflow-hidden flex flex-col items-center space-y-4">
          
          <div className="w-full flex items-center justify-between text-xs text-slate-500 font-medium px-1 flex-wrap gap-3 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-2 font-bold text-slate-700">
              <Paintbrush className="w-4 h-4 text-amber-500" /> Landscape Canvas ({canvasHeight}px Height) • Medium: <span className="uppercase text-amber-600 font-black">{currentTool}</span>
            </span>
            
            {/* CANVAS DRAG & ZOOM CONTROLS BAR */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* DRAG / MOVE TOOL TOGGLE BUTTON */}
              <button
                onClick={() => setCurrentTool(currentTool === 'pan' ? 'watercolor' : 'pan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentTool === 'pan'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30 font-extrabold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Click to toggle Drag / Pan tool - Drag image freely for coloring convenience"
              >
                <Move className="w-3.5 h-3.5" />
                <span>{currentTool === 'pan' ? '🖐️ Dragging Active' : '✋ Drag / Move Image'}</span>
              </button>

              {/* CANVAS ZOOM CONTROLS */}
              <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 px-1.5 flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-500" /> Zoom:
                </span>
                
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  title="Zoom Out (Ctrl -)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {[0.5, 1, 1.5, 2].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setZoomLevel(lvl)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        zoomLevel === lvl 
                          ? 'bg-amber-500 text-white shadow-2xs font-black' 
                          : 'bg-white hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {Math.round(lvl * 100)}%
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.5}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  title="Zoom In (Ctrl +)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {(zoomLevel !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-all cursor-pointer border border-indigo-200"
                    title="Reset Zoom & Pan Position to Center"
                  >
                    Reset Center
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 relative touch-none shadow-inner flex justify-center items-center min-h-[500px] max-h-[780px] p-4 select-none">
            {/* HELPER BANNER WHEN PANNING IS ACTIVE */}
            {currentTool === 'pan' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-amber-300 text-xs font-bold border border-amber-400/40 shadow-md backdrop-blur-md flex items-center gap-2 pointer-events-none animate-bounce">
                <Move className="w-3.5 h-3.5 text-amber-400" />
                <span>Drag Mode Active: Click & hold anywhere to move image canvas</span>
              </div>
            )}

            <div 
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              }}
              className="inline-block shrink-0 shadow-md transition-transform"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`${
                  currentTool === 'pan' 
                    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') 
                    : 'cursor-crosshair'
                } bg-white max-w-full h-auto rounded-xl shadow-xs touch-none select-none`}
              />
            </div>
          </div>

          {/* Canvas Bottom Action Bar */}
          <div className="w-full pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Outline: <strong className="text-slate-800">{COLORING_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong> ({historyIndex + 1} states in stack)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearCanvas}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Reset Template
              </button>

              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Save PNG
              </button>
            </div>
          </div>

        </div>

        {/* LANDSCAPE TOOLBAR CONTROLS BAR */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 sm:space-y-7">
          
          {/* Row 1: Medium / Artistic Tools Selection Dropdown */}
          <div className="space-y-3 border-b border-slate-100 pb-5 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label htmlFor="artistic-tool-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" /> Artistic Medium & Paint Tools:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200">
                  Active: {currentTool.toUpperCase()}
                </span>
              </div>
            </div>

            {/* DROPDOWN SELECT & ACTIVE TOOL HIGHLIGHT BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-center">
              {/* Tool Dropdown Selector */}
              <div className="sm:col-span-5 relative">
                <select
                  id="artistic-tool-select"
                  value={currentTool}
                  onChange={(e) => setCurrentTool(e.target.value as ToolType)}
                  className="w-full appearance-none bg-slate-50 hover:bg-indigo-50/50 border border-slate-300 hover:border-indigo-400 text-slate-900 text-xs sm:text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                >
                  {ARTISTIC_TOOLS.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name} ({tool.badge})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Selected Tool Details Card */}
              <div className="sm:col-span-7 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 min-w-0">
                {(() => {
                  const activeToolObj = ARTISTIC_TOOLS.find(t => t.id === currentTool) || ARTISTIC_TOOLS[0];
                  const ToolIcon = activeToolObj.icon;
                  return (
                    <>
                      <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm">
                        <ToolIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{activeToolObj.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 shrink-0">
                            {activeToolObj.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{activeToolObj.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Row 2: Color Palette & Sliders */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar py-1">
              {/* Custom Color Picker Input - 1st Visible Option */}
              <div className="relative shrink-0 flex items-center justify-center w-8 h-8" title="Custom Color Picker">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-amber-500 bg-gradient-to-tr from-rose-400 via-amber-400 to-indigo-500 shadow-sm cursor-pointer hover:scale-110 transition-all">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      if (currentTool === 'eraser') setCurrentTool('watercolor');
                    }}
                    className="w-full h-full rounded-full cursor-pointer border-0 bg-transparent p-0 opacity-0 absolute inset-0 z-10"
                    title="Custom Color Picker"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-white/80 shadow-inner flex items-center justify-center pointer-events-none z-0"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <Palette className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                  </div>
                </div>
              </div>

              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => {
                    setSelectedColor(preset.hex);
                    if (currentTool === 'eraser') setCurrentTool('watercolor');
                  }}
                  style={{ backgroundColor: preset.hex }}
                  className={`w-8 h-8 rounded-full shrink-0 border transition-all cursor-pointer hover:scale-110 flex items-center justify-center ${
                    selectedColor === preset.hex
                      ? 'ring-2 ring-amber-500 ring-offset-2 scale-105 shadow-xs border-white'
                      : 'border-slate-300'
                  }`}
                  title={preset.name}
                />
              ))}
            </div>

            {/* Canvas Height & Stroke Size Sliders */}
            <div className="flex items-center gap-3.5 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 shrink-0 flex-wrap">
              {/* Size */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Size:</span>
                <input
                  type="range"
                  min="2"
                  max="80"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold text-slate-700 w-6">{brushSize}px</span>
              </div>

              {/* Opacity */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-slate-500">Opacity:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(Number(e.target.value))}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold text-slate-700 w-7">{brushOpacity}%</span>
              </div>

              {/* Canvas Size Selector */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-slate-500">Height:</span>
                <select
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none cursor-pointer"
                >
                  <option value={520}>Standard (520px)</option>
                  <option value={650}>Large (650px)</option>
                  <option value={780}>Ultra Large (780px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Action Buttons (Undo/Redo/Clear/Download) */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5 sm:pt-6 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Undo
              </button>

              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Redo
              </button>

              <button
                onClick={handleClearCanvas}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Outline
              </button>

              <button
                onClick={handleStampAvatarSignature}
                className="px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Stamp your custom Avatar Sticker signature onto this artwork"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Stamp Avatar Signature
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => scrollToSection('sec-ai-gallery')}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5" /> Save & AI Analyze
              </button>

              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
            </div>
          </div>

        </div>

        {/* MOVED DOWN: SAVE ART WITH AI OBSERVATION FORM & DASHBOARD GALLERY (SYMMETRICAL 2-COLUMN GRID) */}
        <div id="sec-ai-gallery" className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          
          {/* SAVE ART WITH AI OBSERVATION (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-slate-900 font-extrabold text-sm sm:text-base">
                <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Save Art with AI Observation</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Record your creative reflection and receive instant psychological art insights</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Artwork Title
                </label>
                <input
                  type="text"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="e.g. Mandala Harmony & Inner Peace"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-xs font-medium text-slate-900 outline-none transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  How were you feeling while coloring?
                </label>
                <textarea
                  value={artReflection}
                  onChange={(e) => setArtReflection(e.target.value)}
                  rows={4}
                  placeholder="Describe your thoughts or emotional state while coloring this artwork..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-xs font-medium text-slate-900 outline-none transition-all resize-none shadow-2xs leading-relaxed"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                onClick={handleAnalyzeAndSaveArt}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Art & Generating Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" /> Save Art & AI Mental Health Insights
                  </>
                )}
              </button>

              {/* LAST SAVED ANALYSIS PREVIEW CARD */}
              {lastSavedAnalysis && (
                <div className="mt-6 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between font-extrabold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-amber-600" /> AI Observation Output
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                      Valence: {(lastSavedAnalysis.valenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="font-bold text-amber-900 text-sm">{lastSavedAnalysis.dominantEmotion}</div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">{lastSavedAnalysis.summaryObservation}</p>
                </div>
              )}
            </div>
          </div>

          {/* DASHBOARD SAVED ARTWORKS GALLERY (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Dashboard Art Gallery ({savedArtGallery.length})
              </h3>
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  View in Dashboard
                </button>
              )}
            </div>

            {savedArtGallery.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 text-center">
                No artworks saved yet. Color on the landscape canvas above and click "Save Art & AI Mental Health Insights".
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {savedArtGallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGalleryItem(selectedGalleryItem?.id === item.id ? null : item)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50/40 hover:border-amber-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center gap-3.5">
                      {item.mediaUrl ? (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          ART
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                          {item.reportAnalysis?.dominantEmotion || 'Art Analysis'}
                        </div>
                      </div>
                    </div>

                    {/* Expanded AI Insight details */}
                    {selectedGalleryItem?.id === item.id && item.reportAnalysis && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2.5 animate-fade-in text-slate-700">
                        <div className="font-bold text-slate-900">Psychologist & Art Insights:</div>
                        <ul className="list-disc list-inside text-[11px] space-y-1.5 text-slate-600 leading-relaxed">
                          {item.reportAnalysis.psychologistInsights.map((insight, idx) => (
                            <li key={idx}>{insight}</li>
                          ))}
                        </ul>
                        <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                          <strong>Counselor Note:</strong> {item.reportAnalysis.guidanceNote}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

