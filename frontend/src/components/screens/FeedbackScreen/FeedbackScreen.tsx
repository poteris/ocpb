import React from "react";
import { X, Star, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {useState, useEffect } from "react";
import axios from "axios";
import { FeedbackData } from "@/types/feedback";
import FeedbackSkeleton from "./FeedbackSkeleton";
import { useRouter } from "next/navigation";

interface FeedbackPopoverProps {
  conversationId: string;
}



async function generateFeedbackOnConversation(conversationId: string) {
  const feedbackResponse = await axios.post<FeedbackData>("/api/feedback/generate-feedback", {
    conversationId,
  });
  return feedbackResponse.data;
}


export const FeedbackPopover: React.FC<FeedbackPopoverProps> = ({
  conversationId,
}) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsLoadingFeedback(true);
    generateFeedbackOnConversation(conversationId).then((data) => {
      setFeedbackData(data);
      setIsLoadingFeedback(false);
    });
  }, [conversationId]);

  function onClose () {

    router.push("/");
  }


  const handleContinueChat = () => {
    router.push(`/chat-screen?conversationId=${conversationId}`);
  }

  return (
    isLoadingFeedback ? (
      <FeedbackSkeleton />
    ) : (
      <div className="fixed inset-0 bg-white  z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 ">
          <h2 className="text-xl font-bold text-gray-900 ">Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto">
          <div className="p-4">
            <>
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 mb-6 text-white">
                <h3 className="text-lg font-bold mb-2">Performance Score</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={24} fill={index < (feedbackData?.score || 0) ? "white" : "none"} stroke="white" />
                    ))}
                  </div>
                </div>

                {feedbackData && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900 ">Summary</h3>
                      <p className="text-gray-700 ">{feedbackData.summary}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-gray-900 ">Strengths</h3>
                      {feedbackData.strengths.map((strength, index) => (
                        <div key={index} className="mb-4 flex">
                          <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900 ">{strength.title}</h4>
                            <p className="text-gray-600 ">{strength.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4 text-gray-900 ">Areas for Improvement</h3>
                      {feedbackData.areas_for_improvement.map((area, index) => (
                        <div key={index} className="mb-4 flex">
                          <AlertCircle className="text-orange-500 mr-2 flex-shrink-0" size={20} />
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900 ">{area.title}</h4>
                            <p className="text-gray-600 ">{area.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
          
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between border-t border-gray-200 ">
          {<Button onClick={handleContinueChat}>Continue Chatting</Button>}
        </div>
      </div>
    )
  );
};

export default FeedbackPopover;