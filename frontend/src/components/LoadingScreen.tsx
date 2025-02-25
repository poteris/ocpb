import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'react-feather';

interface LoadingScreenProps {
  title: string;
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ title, message }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader size={48} className="text-pcsprimary-02 " />
        </motion.div>
        <h2 className="text-2xl font-bold mb-4 text-pcsprimary-04 ">
          {title}
        </h2>
        <p className="text-pcsprimary-03 ">
          {message}
        </p>
      </div>
    </motion.div>
  );
}; 