import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { X } from 'lucide-react';

const FeedbackSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton className="h-8 w-32" />
        <button

          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X size={24} />
        </button>
      </div>


      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
          {/* Performance Score Card */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 mb-6">
            <Skeleton className="h-6 w-40 bg-white/50 mb-4" />
            <div className="flex space-x-2">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-6 w-6 bg-white/50" />
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Strengths Section */}
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            {[...Array(3)].map((_, index) => (
              <div key={index} className="mb-4 flex">
                <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Areas for Improvement Section */}
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            {[...Array(3)].map((_, index) => (
              <div key={index} className="mb-4 flex">
                <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

export default FeedbackSkeleton;