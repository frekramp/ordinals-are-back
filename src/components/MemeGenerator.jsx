import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  Upload, Download, Type, X, Plus, RotateCcw, Image as ImageIcon,
  Minus, Maximize2, Trash2, Palette, Sticker, Crown, Move
} from 'lucide-react';

// ==================== SHARED SVG FILTERS ====================
const SvgFilters = () => (
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
    </filter>
    <linearGradient id="g-orange" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFB347"/><stop offset="100%" stopColor="#F7931A"/></linearGradient>
    <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
    <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff6b6b"/><stop offset="100%" stopColor="#dc2626"/></linearGradient>
    <linearGradient id="g-purple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient>
    <linearGradient id="g-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#86efac"/><stop offset="100%" stopColor="#22c55e"/></linearGradient>
    <linearGradient id="g-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
    <linearGradient id="g-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2a2a2a"/><stop offset="100%" stopColor="#0d0d0d"/></linearGradient>
    <linearGradient id="g-pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff0066"/><stop offset="100%" stopColor="#cc0052"/></linearGradient>
    <linearGradient id="g-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient>
  </defs>
);

// ==================== STICKER COMPONENTS ====================

const S = ({ size, vw, vh, r, fill, stroke, children }) => (
  <svg width={size} height={size * (vh / vw)} viewBox={`0 0 ${vw} ${vh}`}>
    <rect x="3" y="3" width={vw - 6} height={vh - 6} rx={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} filter="url(#shadow)" />
    {stroke && <rect x="10" y="10" width={vw - 20} height={vh - 20} rx={Math.max(0, r - 4)} fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />}
    {children}
  </svg>
);

const T = ({ x, y, size, fill, children, spacing = 2 }) => (
  <text x={x} y={y} textAnchor="middle" fill={fill} fontSize={size} fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing={spacing}>{children}</text>
);

const LaserEyes = ({ size }) => (
  <svg width={size} height={size * 0.42} viewBox="0 0 240 100">
    <defs><linearGradient id="lz" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff0000" stopOpacity="0.3"/><stop offset="50%" stopColor="#ff3333" stopOpacity="1"/><stop offset="100%" stopColor="#ff0000" stopOpacity="0.3"/></linearGradient><filter id="lg"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="0" y="30" width="240" height="16" fill="url(#lz)" rx="8" filter="url(#lg)" />
    <rect x="0" y="54" width="240" height="16" fill="url(#lz)" rx="8" filter="url(#lg)" />
    <ellipse cx="70" cy="38" rx="28" ry="20" fill="#ff0000" opacity="0.2" />
    <ellipse cx="170" cy="62" rx="28" ry="20" fill="#ff0000" opacity="0.2" />
  </svg>
);

const WagmiBadge = ({ size }) => <S size={size} vw={220} vh={92} r={16} fill="url(#g-orange)"><T x={110} y={60} size={32} fill="#fff">WAGMI</T></S>;
const HodlBadge = ({ size }) => <S size={size} vw={200} vh={76} r={38} fill="url(#g-gold)"><T x={100} y={52} size={28} fill="#1a1200" spacing={4}>HODL</T></S>;
const NgmiBadge = ({ size }) => <S size={size} vw={200} vh={84} r={14} fill="url(#g-red)"><T x={100} y={56} size={34} fill="#fff">NGMI</T></S>;
const CopiumBadge = ({ size }) => <S size={size} vw={200} vh={84} r={12} fill="url(#g-blue)"><T x={100} y={56} size={30} fill="#fff">COPIUM</T></S>;
const DegenBadge = ({ size }) => <S size={size} vw={200} vh={84} r={12} fill="#0a0a0a" stroke="#ff0066"><T x={100} y={56} size={32} fill="#ff0066">DEGEN</T></S>;
const RektBadge = ({ size }) => <S size={size} vw={200} vh={84} r={10} fill="#0a0a0a" stroke="#ff0000"><line x1="30" y1="25" x2="170" y2="60" stroke="#ff0000" strokeWidth="2" opacity="0.4"/><T x={100} y={56} size={34} fill="#ff0000">REKT</T></S>;
const BasedBadge = ({ size }) => <S size={size} vw={200} vh={84} r={12} fill="url(#g-teal)"><T x={100} y={56} size={32} fill="#fff">BASED</T></S>;

const BitcoinLogo = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="url(#g-orange)" filter="url(#shadow)" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
    <text x="50" y="68" textAnchor="middle" fill="white" fontSize="48" fontWeight="bold" fontFamily="serif">₿</text>
  </svg>
);

const OrdinalMaxi = ({ size }) => (
  <svg width={size} height={size * 0.56} viewBox="0 0 220 124">
    <rect x="6" y="6" width="208" height="112" rx="14" fill="url(#g-dark)" stroke="url(#g-orange)" strokeWidth="3" filter="url(#shadow)" />
    <circle cx="110" cy="44" r="26" fill="none" stroke="#F7931A" strokeWidth="3" />
    <circle cx="110" cy="44" r="18" fill="none" stroke="#F7931A" strokeWidth="2" />
    <circle cx="110" cy="44" r="6" fill="#F7931A" />
    <line x1="110" y1="18" x2="110" y2="70" stroke="#F7931A" strokeWidth="2" />
    <line x1="84" y1="44" x2="136" y2="44" stroke="#F7931A" strokeWidth="2" />
    <path d="M40 84 L110 24 L180 84" fill="none" stroke="#F7931A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <circle cx="40" cy="84" r="4" fill="#F7931A" /><circle cx="180" cy="84" r="4" fill="#F7931A" /><circle cx="110" cy="24" r="4" fill="#F7931A" />
    <text x="110" y="106" textAnchor="middle" fill="#F7931A" fontSize="13" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="3">ORDINAL MAXI</text>
  </svg>
);

const CrownBadge = ({ size }) => (
  <svg width={size} height={size * 0.58} viewBox="0 0 200 116">
    <path d="M12 80 L36 20 L78 50 L100 10 L122 50 L164 20 L188 80 Z" fill="url(#g-gold)" stroke="#B8860B" strokeWidth="3" strokeLinejoin="round" filter="url(#shadow)" />
    <circle cx="36" cy="20" r="10" fill="#dc2626" stroke="#B8860B" strokeWidth="2" />
    <circle cx="100" cy="10" r="12" fill="#dc2626" stroke="#B8860B" strokeWidth="2" />
    <circle cx="164" cy="20" r="10" fill="#dc2626" stroke="#B8860B" strokeWidth="2" />
    <rect x="38" y="76" width="124" height="12" rx="6" fill="#B8860B" />
    <text x="100" y="108" textAnchor="middle" fill="#FFD700" fontSize="15" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif">KING</text>
  </svg>
);

const InscribedStamp = ({ size }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 220 106">
    <ellipse cx="110" cy="53" rx="100" ry="44" fill="none" stroke="#dc2626" strokeWidth="5" filter="url(#shadow)" />
    <ellipse cx="110" cy="53" rx="90" ry="36" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="8 5" />
    <text x="110" y="60" textAnchor="middle" fill="#dc2626" fontSize="24" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="3">INSCRIBED</text>
  </svg>
);

const DigitalArtifact = ({ size }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 200 104">
    <circle cx="100" cy="52" r="46" fill="url(#g-dark)" stroke="url(#g-orange)" strokeWidth="3" filter="url(#shadow)" />
    <circle cx="100" cy="52" r="38" fill="none" stroke="#F7931A" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
    <text x="100" y="46" textAnchor="middle" fill="#F7931A" fontSize="12" fontWeight="700" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="2">DIGITAL</text>
    <text x="100" y="66" textAnchor="middle" fill="#F7931A" fontSize="12" fontWeight="700" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="2">ARTIFACT</text>
  </svg>
);

const OneBtcBadge = ({ size }) => (
  <svg width={size} height={size * 0.38} viewBox="0 0 220 84">
    <rect x="3" y="3" width="214" height="78" rx="10" fill="url(#g-dark)" stroke="url(#g-orange)" strokeWidth="3" filter="url(#shadow)" />
    <text x="110" y="40" textAnchor="middle" fill="#F7931A" fontSize="18" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif">1 BTC = 1 BTC</text>
    <text x="110" y="62" textAnchor="middle" fill="#666" fontSize="10" fontFamily="Space Mono, monospace">Have Fun Staying Poor</text>
  </svg>
);

const BullishChart = ({ size }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 200 104">
    <rect x="6" y="6" width="188" height="76" rx="10" fill="url(#g-dark)" stroke="url(#g-green)" strokeWidth="2.5" filter="url(#shadow)" />
    <polyline points="28,68 55,54 82,58 115,34 148,40 178,18" fill="none" stroke="url(#g-green)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="172,18 178,18 178,24" fill="#22c55e" />
    <text x="100" y="94" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif">BULLISH</text>
  </svg>
);

const WenBadge = ({ size }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 200 104">
    <rect x="6" y="6" width="188" height="76" rx="12" fill="url(#g-dark)" stroke="#F7931A" strokeWidth="3" filter="url(#shadow)" />
    <text x="100" y="38" textAnchor="middle" fill="#F7931A" fontSize="22" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="2">WEN</text>
    <line x1="50" y1="48" x2="150" y2="48" stroke="#F7931A" strokeWidth="1.5" opacity="0.4" />
    <text x="100" y="68" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="1">MOON?</text>
    <circle cx="28" cy="28" r="3" fill="#F7931A" opacity="0.6" />
    <circle cx="172" cy="60" r="2" fill="#F7931A" opacity="0.4" />
  </svg>
);

const SnipedBadge = ({ size }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 200 104">
    <rect x="6" y="6" width="188" height="76" rx="10" fill="url(#g-dark)" stroke="#dc2626" strokeWidth="3" filter="url(#shadow)" />
    <circle cx="100" cy="44" r="26" fill="none" stroke="#dc2626" strokeWidth="2.5" />
    <circle cx="100" cy="44" r="16" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />
    <line x1="100" y1="12" x2="100" y2="76" stroke="#dc2626" strokeWidth="1" />
    <line x1="64" y1="44" x2="136" y2="44" stroke="#dc2626" strokeWidth="1" />
    <circle cx="100" cy="44" r="4" fill="#dc2626" />
    <text x="100" y="92" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif">SNIPED</text>
  </svg>
);

const MoonBadge = ({ size }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 220 106">
    <rect x="6" y="6" width="208" height="84" rx="16" fill="url(#g-dark)" stroke="url(#g-gold)" strokeWidth="3" filter="url(#shadow)" />
    <path d="M54 28 A20 20 0 1 1 44 72 A16 16 0 1 0 54 28Z" fill="#FFD700" opacity="0.12" />
    <circle cx="34" cy="32" r="2.5" fill="#FFD700" />
    <circle cx="180" cy="28" r="2" fill="#FFD700" />
    <circle cx="168" cy="58" r="1.5" fill="#FFD700" opacity="0.5" />
    <text x="110" y="64" textAnchor="middle" fill="#FFD700" fontSize="40" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="8">MOON</text>
  </svg>
);

const FireBadge = ({ size }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 200 104">
    <rect x="6" y="6" width="188" height="76" rx="10" fill="url(#g-dark)" stroke="#ea580c" strokeWidth="3" filter="url(#shadow)" />
    <path d="M85 70 Q100 20 115 70 Q100 55 85 70" fill="#ea580c" />
    <path d="M95 65 Q100 40 105 65 Q100 58 95 65" fill="#fbbf24" />
    <text x="100" y="92" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="800" fontFamily="Orbitron, Arial, sans-serif">FIRE</text>
  </svg>
);

const OrdinalsBackBadge = ({ size }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 240 116">
    <rect x="6" y="6" width="228" height="84" rx="16" fill="url(#g-dark)" stroke="url(#g-orange)" strokeWidth="3" filter="url(#shadow)" />
    <text x="120" y="42" textAnchor="middle" fill="#F7931A" fontSize="18" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="3">ORDINALS</text>
    <text x="120" y="72" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900" fontFamily="Orbitron, Arial, sans-serif" letterSpacing="2">ARE BACK</text>
  </svg>
);

// ==================== REGISTRY ====================

const STICKERS = {
  laser:     { Component: LaserEyes,       name: 'Laser Eyes',      defaultSize: 200, category: 'bitcoin' },
  wagmi:     { Component: WagmiBadge,      name: 'WAGMI',           defaultSize: 180, category: 'bitcoin' },
  hodl:      { Component: HodlBadge,       name: 'HODL',            defaultSize: 160, category: 'bitcoin' },
  btc:       { Component: BitcoinLogo,     name: 'Bitcoin',         defaultSize: 100, category: 'bitcoin' },

  maxi:      { Component: OrdinalMaxi,     name: 'Ordinal Maxi',    defaultSize: 200, category: 'ordinals' },
  artifact:  { Component: DigitalArtifact, name: 'Digital Artifact', defaultSize: 160, category: 'ordinals' },
  inscribed: { Component: InscribedStamp,  name: 'Inscribed',       defaultSize: 180, category: 'ordinals' },
  onebtc:    { Component: OneBtcBadge,     name: '1 BTC = 1 BTC',   defaultSize: 180, category: 'bitcoin' },
  crown:     { Component: CrownBadge,      name: 'Crown',           defaultSize: 160, category: 'nft' },
  bullish:   { Component: BullishChart,    name: 'Bullish',         defaultSize: 180, category: 'nft' },
  moon:      { Component: MoonBadge,       name: 'Moon',            defaultSize: 160, category: 'meme' },
  wen:       { Component: WenBadge,        name: 'Wen Moon',        defaultSize: 160, category: 'meme' },
  sniped:    { Component: SnipedBadge,     name: 'Sniped',          defaultSize: 160, category: 'nft' },
  ngmi:      { Component: NgmiBadge,       name: 'NGMI',            defaultSize: 180, category: 'meme' },
  rekt:      { Component: RektBadge,       name: 'Rekt',            defaultSize: 180, category: 'meme' },
  degen:     { Component: DegenBadge,      name: 'Degen',           defaultSize: 180, category: 'meme' },
  copium:    { Component: CopiumBadge,     name: 'Copium',          defaultSize: 180, category: 'meme' },
  based:     { Component: BasedBadge,      name: 'Based',           defaultSize: 180, category: 'meme' },
  fire:      { Component: FireBadge,       name: 'Fire',            defaultSize: 160, category: 'meme' },
  ordinalsback: { Component: OrdinalsBackBadge, name: 'Ordinals Are Back', defaultSize: 200, category: 'ordinals' },
};

const CATEGORIES = {
  bitcoin:  { label: 'Bitcoin',  icon: '₿' },
  ordinals: { label: 'Ordinals', icon: '◉' },
  nft:      { label: 'NFT',      icon: '♔' },
  meme:     { label: 'Memes',    icon: '😂' },
};

// ==================== COMPONENT ====================

function MemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(32);
  const [activeCategory, setActiveCategory] = useState('all');
  const canvasRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const addText = useCallback(() => {
    if (!textInput.trim()) return;
    const newText = {
      id: Date.now(),
      text: textInput,
      x: 50,
      y: 50,
      fontSize: textSize,
      color: textColor,
    };
    setTexts((prev) => [...prev, newText]);
    setTextInput('');
  }, [textInput, textColor, textSize]);

  const addSticker = useCallback((type) => {
    const stickerDef = STICKERS[type];
    const newSticker = {
      id: Date.now(),
      type,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      size: stickerDef.defaultSize,
    };
    setStickers((prev) => [...prev, newSticker]);
  }, []);

  const removeItem = useCallback((id, type) => {
    if (type === 'text') setTexts((prev) => prev.filter((t) => t.id !== id));
    else setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId]);

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = useCallback((e, id, type) => {
    e.stopPropagation();
    setSelectedId(id);
    setSelectedType(type);
    const rect = canvasRef.current.getBoundingClientRect();
    const item = type === 'text'
      ? texts.find(t => t.id === id)
      : stickers.find(s => s.id === id);
    if (!item) return;

    const pos = getClientPos(e);
    setDragState({
      id,
      type,
      startX: pos.x,
      startY: pos.y,
      initialX: item.x,
      initialY: item.y,
    });
  }, [texts, stickers]);

  const handleResizeStart = useCallback((e, stickerId) => {
    e.stopPropagation();
    e.preventDefault();
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;
    const pos = getClientPos(e);
    setResizeState({
      id: stickerId,
      startX: pos.x,
      startY: pos.y,
      initialSize: sticker.size,
    });
  }, [stickers]);

  const handleTextSizeChange = useCallback((newSize) => {
    setTextSize(newSize);
    if (selectedId && selectedType === 'text') {
      setTexts((prev) => prev.map((t) =>
        t.id === selectedId ? { ...t, fontSize: newSize } : t
      ));
    }
  }, [selectedId, selectedType]);

  useEffect(() => {
    if (!dragState && !resizeState) return;

    const handleMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = getClientPos(e);

      if (dragState) {
        const dx = ((pos.x - dragState.startX) / rect.width) * 100;
        const dy = ((pos.y - dragState.startY) / rect.height) * 100;
        const newX = Math.max(0, Math.min(95, dragState.initialX + dx));
        const newY = Math.max(0, Math.min(95, dragState.initialY + dy));

        if (dragState.type === 'text') {
          setTexts((prev) => prev.map((t) =>
            t.id === dragState.id ? { ...t, x: newX, y: newY } : t
          ));
        } else {
          setStickers((prev) => prev.map((s) =>
            s.id === dragState.id ? { ...s, x: newX, y: newY } : s
          ));
        }
      }

      if (resizeState) {
        const dx = pos.x - resizeState.startX;
        const dy = pos.y - resizeState.startY;
        const delta = (dx + dy) * 0.5;
        const newSize = Math.max(30, Math.min(500, resizeState.initialSize + delta));
        setStickers((prev) => prev.map((s) =>
          s.id === resizeState.id ? { ...s, size: Math.round(newSize) } : s
        ));
      }
    };

    const handleEnd = () => {
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragState, resizeState]);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setSelectedId(null);
    setSelectedType(null);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#0d0d0d',
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = 'ordinals-are-back-meme.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
      }
    }, 100);
  }, []);

  const handleShareX = useCallback(async () => {
    if (!canvasRef.current) return;
    setSelectedId(null);
    setSelectedType(null);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#0d0d0d',
          scale: 2,
        });
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) return;
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        const text = 'Check yours 🟧 https://ordinals-lab.vercel.app — built by @frekramp';

        // 1) Mobile / native share → X app gets image + text automatically
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], text });
            return;
          } catch (err) {
            // User cancelled — fall through
          }
        }

        // 2) Desktop: copy image to clipboard + open X compose
        if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            return;
          } catch (err) {
            // Clipboard failed — fall through
          }
        }

        // 3) Fallback: download + open X compose
        const link = document.createElement('a');
        link.download = 'ordinals-are-back-meme.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      } catch (err) {
        console.error('Share failed:', err);
      }
    }, 100);
  }, []);

  const clearAll = useCallback(() => {
    setTexts([]);
    setStickers([]);
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  const filteredStickers = activeCategory === 'all'
    ? Object.entries(STICKERS)
    : Object.entries(STICKERS).filter(([_, s]) => s.category === activeCategory);

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            Meme <span className="text-gradient">Lab</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Upload an image, add Bitcoin & Ordinals stickers, resize and position everything. Then post it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Canvas Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 hover:border-bitcoin-orange/50 bg-white/5 cursor-pointer transition-colors">
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <span className="text-gray-400 font-medium">Drop an image or click to upload</span>
                <span className="text-gray-600 text-sm mt-1">JPG, PNG, GIF up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <div
                  ref={canvasRef}
                  className="relative w-full rounded-xl overflow-hidden bg-bitcoin-darker border border-white/10"
                  onClick={() => { setSelectedId(null); setSelectedType(null); }}
                >
                  <svg width="0" height="0"><SvgFilters /></svg>
                  <img src={image} alt="Meme base" className="w-full h-auto block" draggable={false} />

                  {/* Texts */}
                  {texts.map((text) => (
                    <div
                      key={text.id}
                      className={`draggable-text ${selectedId === text.id ? 'ring-2 ring-bitcoin-orange' : ''}`}
                      style={{
                        left: `${text.x}%`,
                        top: `${text.y}%`,
                        fontSize: `${text.fontSize}px`,
                        color: text.color,
                        fontWeight: 'bold',
                        transform: 'translate(-50%, -50%)',
                        zIndex: selectedId === text.id ? 50 : 10,
                        textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, text.id, 'text')}
                      onTouchStart={(e) => handleMouseDown(e, text.id, 'text')}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {text.text}
                      {selectedId === text.id && (
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); removeItem(text.id, 'text'); }}
                          className="absolute -top-5 -right-5 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Stickers */}
                  {stickers.map((sticker) => {
                    const StickerComponent = STICKERS[sticker.type].Component;
                    const isSelected = selectedId === sticker.id;
                    return (
                      <div
                        key={sticker.id}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-bitcoin-orange' : ''}`}
                        style={{
                          left: `${sticker.x}%`,
                          top: `${sticker.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isSelected ? 50 : 10,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, sticker.id, 'sticker')}
                        onTouchStart={(e) => handleMouseDown(e, sticker.id, 'sticker')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StickerComponent size={sticker.size} />
                        {isSelected && (
                          <>
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); removeItem(sticker.id, 'sticker'); }}
                              className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-lg z-50"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <div
                              onMouseDown={(e) => handleResizeStart(e, sticker.id)}
                              onTouchStart={(e) => handleResizeStart(e, sticker.id)}
                              className="absolute -bottom-4 -right-4 w-10 h-10 bg-bitcoin-orange rounded-full border-2 border-white flex items-center justify-center cursor-nwse-resize shadow-lg z-50"
                              title="Drag to resize"
                            >
                              <Move className="w-5 h-5 text-black" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-bitcoin-orange text-black font-bold rounded-lg hover:bg-bitcoin-gold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={handleShareX}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="font-bold text-sm">𝕏</span>
                    Post on X
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                  </button>
                  <label className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-auto">
                    <ImageIcon className="w-4 h-4" />
                    Change Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1"
          >
            {/* Text Tool */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-bitcoin-orange" />
                <h3 className="font-bold text-white text-sm">Add Text</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addText()}
                  placeholder="WAGMI..."
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-bitcoin-orange/50"
                />
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Size</span>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={textSize}
                      onChange={(e) => handleTextSizeChange(parseInt(e.target.value))}
                      className="flex-1 accent-bitcoin-orange"
                    />
                    <span className="text-xs text-gray-400 w-8 text-right">{textSize}px</span>
                  </div>
                </div>
                <button
                  onClick={addText}
                  disabled={!textInput.trim() || !image}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-bitcoin-orange text-black font-bold rounded-lg hover:bg-bitcoin-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Text
                </button>
              </div>
            </div>

            {/* Selected Sticker Info */}
            <AnimatePresence>
              {selectedType === 'sticker' && selectedId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-bitcoin-orange/10 border border-bitcoin-orange/30 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-bitcoin-orange text-sm flex items-center gap-2">
                      <Sticker className="w-4 h-4" />
                      Selected Sticker
                    </h3>
                    <button
                      onClick={() => {
                        const s = stickers.find(x => x.id === selectedId);
                        if (s) removeItem(s.id, 'sticker');
                      }}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, size: Math.max(30, s.size - 20) } : s))}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Maximize2 className="w-3 h-3 text-gray-500" />
                      <input
                        type="range"
                        min="30"
                        max="500"
                        value={stickers.find(s => s.id === selectedId)?.size || 100}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setStickers((prev) => prev.map((s) =>
                            s.id === selectedId ? { ...s, size: val } : s
                          ));
                        }}
                        className="flex-1 accent-bitcoin-orange"
                      />
                    </div>
                    <button
                      onClick={() => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, size: Math.min(500, s.size + 20) } : s))}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-bitcoin-orange/60 mt-2 text-center">
                    Or drag the orange corner handle on the canvas
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stickers */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-bitcoin-gold" />
                  Stickers
                </h3>
                <span className="text-xs text-gray-500">{filteredStickers.length} items</span>
              </div>

              <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-bitcoin-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >All</button>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button key={key} onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === key ? 'bg-bitcoin-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2">
                {filteredStickers.map(([key, sticker]) => (
                  <button key={key} onClick={() => image && addSticker(key)} disabled={!image}
                    className="flex flex-col items-center gap-1.5 p-2 bg-black/20 border border-white/5 rounded-lg hover:border-bitcoin-orange/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <div className="w-full flex items-center justify-center h-12">
                      <sticker.Component size={48} />
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight text-center">{sticker.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-bitcoin-orange/5 border border-bitcoin-orange/20 rounded-xl p-4">
              <p className="text-xs text-bitcoin-orange/80 leading-relaxed">
                <strong className="text-bitcoin-orange">Tip:</strong> Click any element to select it. Drag to move.
                Drag the <strong>orange corner handle</strong> to resize stickers. Click the × to remove.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MemeGenerator;
