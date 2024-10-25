'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { getScenarioPrompts, getPersonaPrompts, getFeedbackPrompts, updatePrompt, createPrompt, deletePrompt } from '@/utils/supabaseQueries';

interface Prompt {
  id: number;
  content: string;
  scenario_id?: string;
  persona_id?: string;
}

const PromptManager: React.FC<{ type: 'scenario' | 'persona' | 'feedback' }> = ({ type }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, [type]);

  const fetchPrompts = async () => {
    let fetchedPrompts;
    switch (type) {
      case 'scenario':
        fetchedPrompts = await getScenarioPrompts();
        break;
      case 'persona':
        fetchedPrompts = await getPersonaPrompts();
        break;
      case 'feedback':
        fetchedPrompts = await getFeedbackPrompts();
        break;
    }
    setPrompts(fetchedPrompts);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setEditContent(prompt.content);
  };

  const handleSave = async (id: number) => {
    await updatePrompt(type, id, editContent);
    setEditingId(null);
    fetchPrompts();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleAdd = async () => {
    if (newPromptContent.trim()) {
      await createPrompt(type, newPromptContent);
      setNewPromptContent('');
      fetchPrompts();
    }
  };

  const handleDuplicate = async (prompt: Prompt) => {
    await createPrompt(type, prompt.content);
    fetchPrompts();
  };

  const handleDelete = async (id: number) => {
    await deletePrompt(type, id);
    fetchPrompts();
  };

  return (
    <div>
      <div className="mb-6">
        <Input
          type="textarea"
          value={newPromptContent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromptContent(e.target.value)}
          className="w-full mb-2"
          rows={3}
          placeholder={`Enter new ${type} prompt`}
        />
        <Button
          variant="progress"
          text={`Add New ${type.charAt(0).toUpperCase() + type.slice(1)} Prompt`}
          onClick={handleAdd}
          className="mt-2"
        />
      </div>

      <div className="space-y-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">ID: {prompt.id}</span>
              {type === 'scenario' && prompt.scenario_id && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Scenario ID: {prompt.scenario_id}</span>
              )}
              {type === 'persona' && prompt.persona_id && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Persona ID: {prompt.persona_id}</span>
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
  );
};

export const SiteAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title="Admin - Prompts" variant="alt" />
      <div className="flex-grow max-w-4xl mx-auto p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Prompt Management</h1>
        
        <Tabs defaultValue="scenario" className="w-full">
          <TabsList>
            <TabsTrigger value="scenario">Scenario Prompts</TabsTrigger>
            <TabsTrigger value="persona">Persona Prompts</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Prompts</TabsTrigger>
          </TabsList>
          <TabsContent value="scenario">
            <PromptManager type="scenario" />
          </TabsContent>
          <TabsContent value="persona">
            <PromptManager type="persona" />
          </TabsContent>
          <TabsContent value="feedback">
            <PromptManager type="feedback" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
