'use client';

import React, { useEffect, useState } from 'react';
import { Button, Modal } from '../ui';
import { Download, Info, Trash2, Plus } from 'react-feather';
import { useRouter } from 'next/navigation';
import { downloadChatHistory, downloadFeedbackAsPDF } from '@/utils/downloadData';
import { ChatSession } from '@/types/chat';
import analysisData from './analysis.json';

const STORAGE_KEY = 'chatSessions';

export const History: React.FC = () => {
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = () => {
    const storedSessions = localStorage.getItem(STORAGE_KEY);
    if (storedSessions) {
      setChatSessions(JSON.parse(storedSessions));
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const handleClearHistory = () => {
    setShowClearHistoryModal(true);
  };

  const confirmClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChatSessions([]);
    setShowClearHistoryModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col h-full max-w-md mx-auto bg-gray-100">
        {/* Scrollable main area */}
        <div className="flex-grow overflow-y-auto">
          {/* Sign up bubble */}
          <div className="bg-pcsprimary01-light m-4 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Info className="text-blue-500 mr-2" size={20} />
              <p className="text-sm">
                Want to save your chat history and feedback?{' '}
                <a href="#" className="text-blue-500 underline">Sign up now</a>
              </p>
            </div>
          </div>
          {/* Chat History section */}
          <div className="m-4 p-4 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chat History</h2>
            </div>
            {chatSessions.length === 0 ? (
              <p className="text-sm text-gray-600">No chat history available.</p>
            ) : (
              chatSessions.map((session) => (
                <div key={session.id} className="mb-4 border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{session.messages[0].text}</h3>
                    <Button 
                      variant="default" 
                      text="View" 
                      onClick={() => router.push(`/initiate-chat?sessionId=${session.id}`)}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {session.messages.length} messages
                  </p>
                  {session.messages[0] && (
                    <p className="text-sm mt-2">
                      {formatDate(session.id)}
                    </p>
                  )}
                </div>
              ))
            )}
            {/* New Scenario button */}
            <div className="mt-4 text-center flex justify-between gap-4">
              <Button
                variant="destructive"
                text="Clear History"
                icon={<Trash2 size={16} />}
                size="sm"
                onClick={handleClearHistory}
              />
              <Button
                variant="progress"
                text="New Scenario"
                icon={<Plus size={16} />}
                onClick={() => router.push('/scenario-setup')}
              />
            </div>
          </div>

          {/* Feedback section */}
          <div className="m-4 p-4">
            <h2 className="text-lg font-semibold mb-2">Feedback</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your feedback or chat history will not be saved unless you create an account. Alternatively, you can save as a PDF.
            </p>
            <div className="flex space-x-2 mb-4">
              <Button
                variant="progress"
                text="Download Chat History"
                icon={<Download size={16} />}
                size="sm"
                onClick={() => downloadChatHistory(chatSessions)}
              />
              <Button
                variant="progress"
                text="Download Feedback"
                icon={<Download size={16} />}
                size="sm"
                onClick={() => downloadFeedbackAsPDF(analysisData)}
              />
            </div>
            {/* Feedback bubbles */}
            <div className="space-y-4">
              {analysisData.areas_for_improvement.map((area, index) => (
                <div key={index} className="bg-pcsprimary01-light p-3 rounded-lg">
                  <h3 className="font-medium mb-1">{area.title}</h3>
                  <p className="text-sm">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create an Account button */}
        <div className="m-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="progress"
              text="Create an Account"
              onClick={() => console.log('Create account clicked')}
              className="w-full"
            />
          </div>
          <p className="text-xs text-center mt-2 text-gray-600">
            <Info size={16} /> Creating an account will help you maintain chat and feedback history for a more personalized experience.
          </p>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearHistoryModal && (
        <Modal
          isOpen={showClearHistoryModal}
          onClose={() => setShowClearHistoryModal(false)}
          title="Clear Chat History"
        >
          <p>Are you sure you want to clear all chat history? This action cannot be undone.</p>
          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              text="Cancel"
              onClick={() => setShowClearHistoryModal(false)}
              className="mr-2"
            />
            <Button
              variant="destructive"
              text="Clear History"
              onClick={confirmClearHistory}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
