import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'medium', color = '#4F46E5' }) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const circleSize = sizeMap[size];

  return (
    <motion.div
      style={{
        width: circleSize,
        height: circleSize,
        borderRadius: '50%',
        border: `${circleSize / 8}px solid ${color}`,
        borderTop: `${circleSize / 8}px solid transparent`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};
