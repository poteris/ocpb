'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSystemPrompts, updateSystemPrompt, createSystemPrompt, deleteSystemPrompt, SystemPrompt } from '@/utils/supabaseQueries';

export const AdminSystemPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    const fetchedPrompts = await getSystemPrompts();
    setPrompts(fetchedPrompts);
  };

  const handleEdit = (prompt: SystemPrompt) => {
    if (prompt.id !== 1) {
      setEditingId(prompt.id);
      setEditContent(prompt.content);
    }
  };

  const handleSave = async (id: number) => {
    await updateSystemPrompt(id, editContent);
    setEditingId(null);
    fetchPrompts();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleAdd = async () => {
    if (newPromptContent.trim()) {
      await createSystemPrompt(newPromptContent);
      setNewPromptContent('');
      fetchPrompts();
    }
  };

  const handleDuplicate = async (prompt: SystemPrompt) => {
    await createSystemPrompt(prompt.content);
    fetchPrompts();
  };

  const handleDelete = async (id: number) => {
    if (id !== 1) {
      await deleteSystemPrompt(id);
      fetchPrompts();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title="Admin - System Prompts" variant="alt" />
      <div className="flex-grow max-w-4xl mx-auto p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">System Prompts</h1>
        
        {/* Instructions for testing */}
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Testing Instructions:</p>
          <p>To test a specific system prompt, add <code>?promptId=X</code> to the URL, where X is the ID of the prompt you want to test.</p>
        </div>

        {/* Add new prompt section */}
        <div className="mb-6">
          <Input
            type="textarea"
            value={newPromptContent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromptContent(e.target.value)}
            className="w-full mb-2"
            rows={3}
            placeholder="Enter new system prompt"
          />
          <Button
            variant="progress"
            text="Add New Prompt"
            onClick={handleAdd}
            className="mt-2"
          />
        </div>

        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">ID: {prompt.id}</span>
                {prompt.id === 1 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Default Prompt</span>
                )}
              </div>
              {editingId === prompt.id ? (
                <>
                  <Input
                    type="textarea"
                    value={editContent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditContent(e.target.value)}
                    className="w-full mb-2"
                    rows={5}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="destructive"
                      text="Cancel"
                      onClick={handleCancel}
                    />
                    <Button
                      variant="progress"
                      text="Save"
                      onClick={() => handleSave(prompt.id)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{prompt.content}</p>
                  <div className="flex justify-end space-x-2">
                    {prompt.id !== 1 && (
                      <>
                        <Button
                          variant="options"
                          text="Edit"
                          onClick={() => handleEdit(prompt)}
                        />
                        <Button
                          variant="destructive"
                          text="Delete"
                          onClick={() => handleDelete(prompt.id)}
                        />
                      </>
                    )}
                    <Button
                      variant="options"
                      text="Duplicate"
                      onClick={() => handleDuplicate(prompt)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
