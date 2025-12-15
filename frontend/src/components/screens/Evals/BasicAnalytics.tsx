"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { EvalConversation } from "@/types/evals";

interface BasicAnalyticsProps {
  conversations: EvalConversation[];
}

// Removed unused chart components

export const BasicAnalytics: React.FC<BasicAnalyticsProps> = ({ conversations }) => {
  const messageHistogram = useMemo(() => {
    // Create histogram bins for message counts
    const maxMessages = Math.max(...conversations.map(c => c.message_count), 0);
    const binSize = Math.max(1, Math.ceil(maxMessages / 20)); // Aim for ~20 bins
    const numBins = Math.ceil(maxMessages / binSize);
    
    const bins = Array.from({ length: numBins }, (_, i) => ({
      range: `${i * binSize + 1}-${(i + 1) * binSize}`,
      count: 0,
      minValue: i * binSize + 1,
      maxValue: (i + 1) * binSize
    }));
    
    conversations.forEach(conv => {
      const binIndex = Math.min(Math.floor((conv.message_count - 1) / binSize), numBins - 1);
      if (binIndex >= 0) {
        bins[binIndex].count++;
      }
    });
    
    return bins.filter(bin => bin.count > 0); // Only show bins with data
  }, [conversations]);

  if (conversations.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <Card className="p-8 text-center text-gray-500">
          No conversations found for the selected filters
        </Card>
      </div>
    );
  }

  const maxCount = Math.max(...messageHistogram.map(bin => bin.count));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Message Count Distribution</h3>
        <div className="space-y-3">
          {messageHistogram.map((bin) => (
            <div key={bin.range} className="flex items-center gap-3">
              <div className="w-20 text-sm font-medium text-gray-600">
                {bin.range}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(bin.count / maxCount) * 100}%` }}
                >
                  {bin.count > 0 && (
                    <span className="text-white text-xs font-medium">{bin.count}</span>
                  )}
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {((bin.count / conversations.length) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Total conversations: {conversations.length} • 
          Average length: {(conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length).toFixed(1)} messages
        </div>
      </Card>
    </div>
  );
};
