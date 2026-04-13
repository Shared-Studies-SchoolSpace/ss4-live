import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, backgroundColor: '#E8640A' }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-brand-primary text-white shadow-2xl flex items-center justify-center cursor-pointer md:bottom-12 md:right-12"
          aria-label="Back to top"
        >
          <ArrowUpwardIcon fontSize="medium" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
