"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface HumanReviewFormProps {
  conversationId: string;
  currentRating?: string | null;
  currentNotes?: string | null;
  onSubmit: (rating: string, notes: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const HumanReviewForm: React.FC<HumanReviewFormProps> = ({
  currentRating,
  currentNotes,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [rating, setRating] = useState(currentRating || '');
  const [notes, setNotes] = useState(currentNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating) {
      onSubmit(rating, notes);
    }
  };

  const getRatingColor = (ratingValue: string) => {
    switch (ratingValue) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'bad': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h5 className="font-medium text-gray-900 mb-3">Add Human Review</h5>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {['excellent', 'good', 'bad'].map((ratingOption) => (
              <button
                key={ratingOption}
                type="button"
                onClick={() => setRating(ratingOption)}
                className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  rating === ratingOption
                    ? getRatingColor(ratingOption)
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {ratingOption.charAt(0).toUpperCase() + ratingOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional comments about this conversation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : currentRating ? 'Update Review' : 'Add Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};
