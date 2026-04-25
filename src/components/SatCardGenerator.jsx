import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  Search, Download, Share2, Bitcoin, Shield, Clock, Hash, Zap,
  AlertCircle, Check, Loader2, RefreshCw, Wallet, Database
} from 'lucide-react';
import {
  fetchAddressCardData,
  fetchInscriptionCardData,
} from '../api/blockchain';

const RARITY_STYLES = {
  Common: { class: 'card-rarity-common', color: '#888888' },
  Uncommon: { class: 'card-rarity-uncommon', color: '#4ade80' },
  Prime: { class: 'card-rarity-rare', color: '#60a5fa' },
  Epic: { class: 'card-rarity-epic', color: '#c084fc' },
  Legendary: { class: 'card-rarity-legendary', color: '#fbbf24' },
  Mythic: { class: 'card-rarity-mythic', color: '#f87171' },
  Vintage: { class: 'card-rarity-vintage', color: '#a3a33a' },
  Pizza: { class: 'card-rarity-pizza', color: '#fb923c' },
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function PatternVisual({ hue1, hue2 }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full opacity-30">
      <defs>
        <radialGradient id={`grad-${hue1}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 70%, 50%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2}, 70%, 20%)`} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill={`url(#grad-${hue1})`} />
      {[...Array(8)].map((_, i) => (
        <circle
          key={i}
          cx={100 + Math.cos((i * Math.PI) / 4) * 50}
          cy={100 + Math.sin((i * Math.PI) / 4) * 50}
          r="20"
          fill={`hsl(${(hue1 + i * 30) % 360}, 60%, 40%)`}
          opacity="0.6"
        />
      ))}
      <circle cx="100" cy="100" r="30" fill={`hsl(${hue2}, 80%, 60%)`} opacity="0.8" />
      <text x="100" y="108" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">₿</text>
    </svg>
  );
}

function isValidBtcAddress(str) {
  if (/^1[a-zA-Z0-9]{25,34}$/.test(str)) return true;
  if (/^3[a-zA-Z0-9]{25,34}$/.test(str)) return true;
  if (/^bc1[qp][ac-hj-np-z02-9]{38,58}$/.test(str)) return true;
  return false;
}

function isValidInscriptionId(str) {
  return /^[a-fA-F0-9]{64}i\d+$/.test(str);
}

function validateInput(str) {
  const trimmed = str.trim();
  if (!trimmed) return { valid: false, error: '' };
  if (isValidBtcAddress(trimmed)) return { valid: true, type: 'Bitcoin Address' };
  if (isValidInscriptionId(trimmed)) return { valid: true, type: 'Inscription ID' };
  return { valid: false, error: 'Invalid BTC address or inscription ID format' };
}

function SatCardGenerator() {
  const [input, setInput] = useState('');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exported, setExported] = useState(false);
  const [touched, setTouched] = useState(false);
  const cardRef = useRef(null);

  const validation = useMemo(() => validateInput(input), [input]);
  const rarityStyle = RARITY_STYLES[cardData?.rarity] || RARITY_STYLES.Common;

  const handleGenerate = useCallback(async () => {
    if (!validation.valid) return;
    setLoading(true);
    setError(null);
    setExported(false);
    setTouched(false);
    setCardData(null);

    try {
      const trimmed = input.trim();
      let data;
      if (isValidBtcAddress(trimmed)) {
        data = await fetchAddressCardData(trimmed);
      } else {
        data = await fetchInscriptionCardData(trimmed);
      }
      setCardData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch on chain data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, validation.valid]);

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d0d0d',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `ordinals-are-back-card-${cardData.input.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [cardData]);

  const handleShareX = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d0d0d',
        scale: 2,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'sat-card.png', { type: 'image/png' });
      const text = 'Check yours 🟧 https://ordinals-lab.vercel.app — built by @frekramp';

      // Mobile: native share sheet → X app gets image + text
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text });
          return;
        } catch (err) {
          // User cancelled — fall through
        }
      }

      // Desktop: download image + open X compose with text
      const link = document.createElement('a');
      link.download = `ordinals-are-back-card-${cardData.input.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [cardData]);

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            Sat <span className="text-gradient">Card</span> Generator
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Look up real on chain stats for any Bitcoin address or inscription ID.
            Then flex it.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Bitcoin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setTouched(true); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && validation.valid && !loading && handleGenerate()}
                placeholder="Enter BTC address or inscription ID..."
                className={`w-full pl-12 pr-10 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  touched && input.trim() && !validation.valid
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                    : touched && validation.valid
                    ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/50'
                    : 'border-white/10 focus:border-bitcoin-orange/50 focus:ring-bitcoin-orange/50'
                }`}
              />
              {touched && input.trim() && (
                validation.valid ? (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !validation.valid}
              className="px-6 py-4 bg-bitcoin-orange text-black font-bold rounded-xl hover:bg-bitcoin-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Reveal</span>
            </button>
          </div>

          {touched && input.trim() && !validation.valid && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {validation.error}
            </motion.p>
          )}

          {validation.valid && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-xs mt-2 ml-1 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Valid {validation.type} detected
            </motion.p>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="text-red-400 text-xs mt-2 flex items-center gap-1 hover:text-red-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-10 h-10 text-bitcoin-orange animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Querying Mempool.space + Hiro...</p>
          </motion.div>
        )}

        {/* Card Display */}
        {cardData && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="flex flex-col items-center gap-8"
          >
            <div
              ref={cardRef}
              className={`relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden holo-card ${rarityStyle.class} gold-border p-6`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-40">
                <PatternVisual hue1={cardData.patternHue} hue2={cardData.patternHue2} />
              </div>

              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-5 h-5" style={{ color: rarityStyle.color }} />
                    <span className="font-display text-[10px] font-bold tracking-wider text-white/80 truncate max-w-[120px] sm:max-w-none">ORDINALS ARE BACK</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-0.5">Card Rarity</span>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{ backgroundColor: rarityStyle.color + '25', color: rarityStyle.color, border: `1.5px solid ${rarityStyle.color}60` }}
                    >
                      {cardData.rarity}
                    </div>
                  </div>
                </div>

                {/* Main Visual */}
                <div className="flex-1 flex items-center justify-center mb-4">
                  <div className="w-40 h-40 rounded-full bg-black/30 backdrop-blur-sm border-2 flex items-center justify-center" style={{ borderColor: rarityStyle.color + '50' }}>
                    <div className="text-center">
                      <Bitcoin className="w-16 h-16 mx-auto mb-2" style={{ color: rarityStyle.color }} />
                      <div className="font-mono text-xs text-white/60">
                        {cardData.inputType === 'address' ? 'Address Card' : 'Inscription'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                  {cardData.inputType === 'address' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Wallet className="w-3 h-3" />
                          <span>Balance</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.balance} BTC</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Database className="w-3 h-3" />
                          <span>UTXOs</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.utxoCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Shield className="w-3 h-3" />
                          <span>Transactions</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.txCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Zap className="w-3 h-3" />
                          <span>Inscriptions</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.inscriptionCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>First Seen</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.firstSeenDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Hash className="w-3 h-3" />
                          <span>First Block</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.firstSeenBlock}</span>
                      </div>

                      {/* Bars */}
                      <div className="pt-2 space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Balance</span>
                            <span className="font-mono" style={{ color: rarityStyle.color }}>
                              {parseFloat(cardData.balance) > 0 ? parseFloat(cardData.balance).toFixed(4) : '0'} BTC
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, parseFloat(cardData.balance) * 2)}%`,
                                backgroundColor: rarityStyle.color,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Inscription Candidates</span>
                            <span className="font-mono" style={{ color: rarityStyle.color }}>
                              {cardData.inscriptionHint}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, cardData.inscriptionHint * 10)}%`,
                                backgroundColor: rarityStyle.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Hash className="w-3 h-3" />
                          <span>Sat Number</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.satNumber}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Shield className="w-3 h-3" />
                          <span>Block</span>
                        </div>
                        <span className="font-mono text-sm text-white">{cardData.firstSeenBlock}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Wallet className="w-3 h-3" />
                          <span>Output Value</span>
                        </div>
                        <span className="font-mono text-xs text-white">{cardData.oldestUtxoValue || '—'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Shield className="w-3 h-3" />
                          <span>TXID Index</span>
                        </div>
                        <span className="font-mono text-xs text-white">{cardData.txid || '—'} i{cardData.index}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Wallet className="w-3 h-3" />
                          <span>Owner</span>
                        </div>
                        <span className="font-mono text-xs text-white">{cardData.address || '—'}</span>
                      </div>

                      {/* Bars */}
                      <div className="pt-2 space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Sat Rarity</span>
                            <span className="font-mono" style={{ color: rarityStyle.color }}>
                              {cardData.rarity}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${['Common','Uncommon','Prime','Epic','Legendary','Mythic'].indexOf(cardData.rarity) * 20 + 10}%`,
                                backgroundColor: rarityStyle.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">
                    {cardData.input.slice(0, 20)}...
                  </span>
                  <span className="font-mono text-[9px] text-white/20">
                    Data: Mempool.space
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-bitcoin-orange text-black font-bold rounded-xl hover:bg-bitcoin-gold transition-colors"
              >
                <Download className="w-4 h-4" />
                {exported ? 'Saved!' : 'Download'}
              </button>
              <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="font-bold text-sm">𝕏</span>
                Post on X
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SatCardGenerator;
