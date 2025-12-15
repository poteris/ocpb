import React from "react";
import { X, CheckCircle, AlertCircle, CircleArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {useState, useEffect } from "react";
import axios from "axios";
import { FeedbackData } from "@/types/feedback";
import FeedbackSkeleton from "./FeedbackSkeleton";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
              <div className="feedback-gradient performance-card rounded-lg text-white flex items-center">
                <div className="feedback-content flex items-center justify-between mx-auto">
                  <div>
                    <h3 className="performance-score">Performance Score</h3>
                    <p className="font-normal mt-3 score-text">You got {feedbackData?.score || 0} out of 5 roses</p>
                  </div>
                  <div className="flex rose-container">
                    {[...Array(5)].map((_, index) => (
                      <Image
                        key={index}
                        src="/images/labour-rose.svg"
                        alt="Labour Rose"
                        width={42}
                        height={42}
                        className={`rose-image ${index < (feedbackData?.score || 0) ? "opacity-100" : "opacity-50"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

                {feedbackData && (
                  <>
                    <div className="mb-6 mt-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900">Summary</h3>
                      <p className="text-gray-700">{feedbackData.summary}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-gray-900 ">Strengths</h3>
                      {feedbackData.strengths.map((strength, index) => (
                        <div key={index} className="mb-4 flex">
                          <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900 ">{strength.title}</h4>
                            <p className="text-gray-600 ">{strength.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-gray-900 ">Areas for Improvement</h3>
                      {feedbackData.areas_for_improvement.map((area, index) => (
                        <div key={index} className="mb-4 flex">
                          <AlertCircle className="text-orange-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900 ">{area.title}</h4>
                            <p className="text-gray-600 ">{area.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-gray-900 ">Try it for real!</h3>
                      <div className="mb-4 flex">
                        <CircleArrowRight className="text-primary mr-2 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-gray-600 ">
                          Now try it for real at a canvassing session near you!  <a href="https://events.labour.org.uk/" target="_blank" rel="noopener noreferrer">https://events.labour.org.uk/</a>
                        </p>
                      </div>
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