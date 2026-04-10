import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Carousel = ({ items, autoPlay = true, interval = 5000 }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextStep = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(nextStep, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextStep]);

  // To show 3 items (prev, active, next)
  const getIndex = (i) => (i + items.length) % items.length;

  const visibleIndices = [
    getIndex(index - 1),
    index,
    getIndex(index + 1),
  ];

  return (
    <div className="relative w-full overflow-hidden py-10">
      <div className="flex justify-center items-center perspective-[1000px]">
        {/* We use a container that helps with positioning */}
        <div className="relative flex items-center justify-center w-full max-w-5xl h-[450px]">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, i) => {
              // Determine position relative to active index
              let position = 0; // 0: center, -1: left, 1: right, 2+: hidden
              
              if (i === index) position = 0;
              else if (i === getIndex(index - 1)) position = -1;
              else if (i === getIndex(index + 1)) position = 1;
              else return null; // Only show 3 at a time

              return (
                <motion.div
                  key={i}
                  initial={{ 
                    scale: 0.8, 
                    x: position * 400, 
                    opacity: 0,
                    zIndex: 0 
                  }}
                  animate={{ 
                    scale: position === 0 ? 1.05 : 0.85, 
                    x: position * 320, 
                    opacity: position === 0 ? 1 : 0.4,
                    zIndex: position === 0 ? 10 : 5,
                    filter: position === 0 ? 'blur(0px)' : 'blur(2px)',
                  }}
                  exit={{ 
                    scale: 0.8, 
                    opacity: 0,
                    x: position * 400
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="absolute w-[350px] md:w-[400px]"
                >
                  {item}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index ? 'bg-brand-primary w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
