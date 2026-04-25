import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    filter: 'blur(20px)',
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 80, rotateX: -90, scale: 0.5 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 12,
    },
  },
};

const pulseRing = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.6, 1.6],
    opacity: [0.6, 0, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeOut' },
  },
};

const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(247,147,26,0.3), 0 0 60px rgba(247,147,26,0.1)',
      '0 0 40px rgba(247,147,26,0.6), 0 0 100px rgba(247,147,26,0.3)',
      '0 0 20px rgba(247,147,26,0.3), 0 0 60px rgba(247,147,26,0.1)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

function IntroSplash({ onComplete }) {
  const [stage, setStage] = useState('button'); // 'button' | 'text' | 'exit'

  useEffect(() => {
    if (stage === 'text') {
      const timer = setTimeout(() => setStage('exit'), 2800);
      return () => clearTimeout(timer);
    }
    if (stage === 'exit') {
      const timer = setTimeout(() => onComplete(), 900);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {stage !== 'exit' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] bg-bitcoin-darker flex items-center justify-center overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 30% 50%, rgba(247,147,26,0.15) 0%, transparent 60%)',
                'radial-gradient(circle at 70% 50%, rgba(247,147,26,0.15) 0%, transparent 60%)',
                'radial-gradient(circle at 30% 50%, rgba(247,147,26,0.15) 0%, transparent 60%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-bitcoin-orange"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(247,147,26,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(247,147,26,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          <AnimatePresence mode="wait">
            {stage === 'button' && (
              <motion.div
                key="button"
                className="relative flex flex-col items-center gap-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, y: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {/* Reveal Button */}
                <div className="relative">
                  {/* Pulsing rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-bitcoin-orange/30"
                    variants={pulseRing}
                    initial="initial"
                    animate="animate"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-bitcoin-orange/20"
                    variants={pulseRing}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: '0.6s' }}
                  />

                  <motion.button
                    onClick={() => setStage('text')}
                    className="relative px-16 py-6 bg-transparent border-2 border-bitcoin-orange text-bitcoin-orange font-display text-xl font-black tracking-widest uppercase rounded-full cursor-pointer overflow-hidden"
                    animate={glowPulse.animate}
                    whileHover={{
                      scale: 1.08,
                      backgroundColor: 'rgba(247,147,26,0.1)',
                      borderColor: '#FFD700',
                      color: '#FFD700',
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span className="relative z-10">REVEAL</span>
                    {/* Shine sweep */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-bitcoin-orange/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                </div>

                {/* Subtext */}
                <motion.p
                  className="text-gray-600 text-sm font-mono"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  Click to enter
                </motion.p>
              </motion.div>
            )}

            {stage === 'text' && (
              <motion.div
                key="text"
                className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 px-4"
                style={{ perspective: 800 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
                transition={{ duration: 0.5 }}
              >
                {['Ordinals', 'are', 'fucking', 'back!'].map((word, i) => (
                  <motion.span
                    key={word}
                    variants={wordVariants}
                    initial="hidden"
                    animate="visible"
                    className={`font-display font-black text-4xl sm:text-6xl md:text-8xl inline-block ${
                      word === 'fucking'
                        ? 'text-red-500'
                        : word === 'back!'
                        ? 'text-gradient'
                        : 'text-white'
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                    transition={{ delay: i * 0.15 }}
                  >
                    {word === 'back!' && (
                      <motion.span
                        className="inline-block"
                        animate={{ rotate: [0, -10, 5, 0], scale: [1, 1.15, 1] }}
                        transition={{ delay: 1.2, duration: 0.5, type: 'spring' }}
                      >
                        {word}
                      </motion.span>
                    )}
                    {word !== 'back!' && word}
                  </motion.span>
                ))}

                {/* Shockwave rings after text appears */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full border border-bitcoin-orange/20"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full border border-bitcoin-orange/10"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom brand hint */}
          {stage === 'button' && (
            <motion.a
              href="https://x.com/frekramp"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-8 left-0 right-0 text-center cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-gray-700 text-xs font-mono tracking-widest hover:text-bitcoin-orange transition-colors">
                BY @FREKRAMP
              </span>
            </motion.a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroSplash;
