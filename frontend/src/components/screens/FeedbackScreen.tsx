import React from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'react-feather';
import { Button } from '../ui';

interface AnalysisData {
  summary: string;
  strengths: { title: string; description: string }[];
  areas_for_improvement: { title: string; description: string }[];
}

interface FeedbackPopoverProps {
  onClose: () => void;
  onContinueChat: () => void;
  score: number;
  analysisData: AnalysisData;
}

export const FeedbackPopover: React.FC<FeedbackPopoverProps> = ({
  onClose,
  onContinueChat,
  score,
  analysisData,
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Feedback</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-lg font-bold mb-2">Performance Score</h3>
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={24}
                  fill={index < score ? 'white' : 'none'}
                  stroke="white"
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Summary</h3>
            <p className="text-gray-700">{analysisData.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">Strengths</h3>
            {analysisData.strengths.map((strength, index) => (
              <div key={index} className="mb-4 flex">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold mb-1">{strength.title}</h4>
                  <p className="text-gray-600">{strength.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Areas for Improvement</h3>
            {analysisData.areas_for_improvement.map((area, index) => (
              <div key={index} className="mb-4 flex">
                <AlertCircle className="text-orange-500 mr-2 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold mb-1">{area.title}</h4>
                  <p className="text-gray-600">{area.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between border-t border-gray-200">
        <Button
          variant="default"
          text="Continue Chatting"
          onClick={onContinueChat}
        />
        <Button
          variant="progress"
          text="Close"
          onClick={onClose}
        />
      </div>
    </div>
  );
};