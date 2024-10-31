'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { getFeedbackPrompts, updatePrompt, createPrompt, deletePrompt, Prompt, getSystemPrompts, PromptWithDetails } from '@/utils/supabaseQueries';
import { Modal } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '@/utils/markdownStyles';

interface PromptManagerProps {
  type: 'system' | 'feedback';
}

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {message}
  </div>
);

// Update template variables based on SQL schema
const AVAILABLE_VARIABLES = {
  scenario: [
    { name: 'title', description: 'The scenario title' },
    { name: 'description', description: 'The scenario description' },
    { name: 'context', description: 'The scenario context' },
    { name: 'objectives', description: 'The scenario objectives' }
  ],
  persona: [
    { name: 'name', description: 'Persona name' },
    { name: 'age', description: 'Persona age' },
    { name: 'job', description: 'Persona job title' },
    { name: 'workplace', description: 'Place of work' },
    { name: 'emotional_conditions_for_supporting_the_union', description: 'Emotional conditions' },
    { name: 'major_issues_in_workplace', description: 'Workplace issues' },
    { name: 'personality_traits', description: 'Personality traits' },
    { name: 'segment', description: 'Demographic segment' },
    { name: 'uk_party_affiliation', description: 'Political affiliation' },
    { name: 'family_status', description: 'Family status' },
    { name: 'busyness_level', description: 'Busyness level' }
  ]
};

// Update the variables section in renderScenarioSection
const renderVariableStatus = (content: string, variables: Array<{ name: string, description: string }>) => (
  <div className="space-y-2">
    {variables.map(({ name, description }) => {
      const variable = `{{${name}}}`;
      const isUsed = content.includes(variable);
      const isLongVariable = name.length > 20;
      
      return (
        <div key={name} className={`flex ${isLongVariable ? 'items-start' : 'items-center'} space-x-2`}>
          <div className={`w-2 h-2 rounded-full ${isLongVariable ? 'mt-1.5' : ''} flex-shrink-0 ${
            isUsed ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div className={`${isLongVariable ? 'flex-1 min-w-0' : ''}`}>
            <code className={`text-sm ${isLongVariable ? 'break-all' : ''} ${
              isUsed ? 'text-green-700 dark:text-green-400' : 'text-gray-500'
            }`}>
              {variable}
            </code>
            <span className={`text-sm text-gray-600 dark:text-gray-400 ${isLongVariable ? 'block' : 'ml-2'}`}>
              - {description}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

const PromptManager: React.FC<PromptManagerProps> = ({ type }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templatePrompt] = useState('');

  const fetchPrompts = useCallback(async () => {
    const fetchedPrompts = type === 'system' 
      ? await getSystemPrompts()
      : await getFeedbackPrompts();
    setPrompts(fetchedPrompts);
  }, [type]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleEdit = (prompt: PromptWithDetails) => {
    try {
      setEditingId(prompt.id);
      setEditContent(prompt.content);
    } catch (error) {
      console.error('Error editing prompt:', error);
      setError('Failed to edit prompt. Please try again.');
    }
  };

  const handleSave = async (id: number) => {
    try {
      await updatePrompt(type, id, editContent);
      setEditingId(null);
      fetchPrompts();
    } catch {
      setError('Failed to update prompt. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleUseTemplate = () => {
    if (templatePrompt) {
      setNewPromptContent(templatePrompt);
    } else {
      setError('No template available. Please create a prompt first.');
    }
  };

  const renderTemplateButton = () => (
    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
      <span className="text-sm text-green-700 dark:text-green-300">Template</span>
      <Button
        variant="options"
        text="Use Template"
        onClick={handleUseTemplate}
        className="text-xs"
        disabled={!templatePrompt}
      />
    </div>
  );

  const renderScenarioSection = () => (
    <div className="space-y-4 mb-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Create a New System Prompt
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Right Column: Variables */}
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                  Available Variables
                </h3>
              </div>
              
              {/* Scenario Variables */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Scenario Variables
                </h4>
                {renderVariableStatus(newPromptContent, AVAILABLE_VARIABLES.scenario)}
              </div>

              {/* Persona Variables */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Persona Variables
                </h4>
                {renderVariableStatus(newPromptContent, AVAILABLE_VARIABLES.persona)}
              </div>

              {renderTemplateButton()}
            </div>
          </div>

          <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Prompt
                </label>
                <Button
                  variant="options"
                  text="Clear"
                  onClick={() => setNewPromptContent('')}
                  className="text-xs"
                />
              </div>
              <Input
                type="textarea"
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                className="w-full mb-2 min-h-[400px]"
                rows={5}
                placeholder="Enter your prompt using the template variables..."
                required
              />
            </div>
        </div>

        {/* Submit Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ready to create?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will add a new prompt to the system.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                text="Clear All"
                onClick={() => {
                  setNewPromptContent('');
                }}
              />
              <Button
                variant="progress"
                text="Add Prompt"
                onClick={handleAdd}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedbackSection = () => (
    <div className="space-y-4 mb-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Prompt Creation */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create a New Feedback Prompt
            </h2>
          </div>

          {/* Right Column: Template */}
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                  Feedback Guidelines
                </h3>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <h4 className="font-medium mb-2">Best Practices:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Be specific and actionable</li>
                    <li>Balance positive feedback with areas for improvement</li>
                    <li>Focus on communication techniques</li>
                    <li>Consider persuasion effectiveness</li>
                    <li>Address handling of objections</li>
                  </ul>
                </div>

                {renderTemplateButton()}
              </div>
            </div>
          </div>
          <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Prompt
                </label>
                <Button
                  variant="options"
                  text="Clear"
                  onClick={() => setNewPromptContent('')}
                  className="text-xs"
                />
              </div>
              <Input
                type="textarea"
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                className="w-full mb-2 min-h-[500px]"
                rows={5}
                placeholder="Enter your feedback prompt..."
                required
              />
            </div>
        </div>

        {/* Submit Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ready to create?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will add a new feedback prompt to the system.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                text="Clear All"
                onClick={() => {
                  setNewPromptContent('');
                }}
              />
              <Button
                variant="progress"
                text="Add Prompt"
                onClick={handleAdd}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Improve error handling with a custom hook
  const useAsyncAction = (action: () => Promise<void>) => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
  };

  // 6. Improve handleAdd with validation and error handling
  const handleAdd = useAsyncAction(async () => {
    try {
      await createPrompt(type, newPromptContent);
      setNewPromptContent('');
      await fetchPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
      setError('Failed to create prompt. Please try again.');
    }
  });

  const handleDuplicate = async (prompt: Prompt) => {
    await createPrompt(type, prompt.content);
    fetchPrompts();
  };

  const handleDeleteClick = (id: number) => {
    setDeletePromptId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePromptId) return;
    
    setLoading(true);
    try {
      await deletePrompt(type, deletePromptId);
      await fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setError('Failed to delete prompt. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletePromptId(null);
    }
  };

  // 7. Extract loading spinner into a component
  const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  // Add TruncatedMarkdown component
  const TruncatedMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const previewLength = 300;
    
    const displayContent = isExpanded ? content : content.slice(0, previewLength);
    const shouldTruncate = content.length > previewLength;
    
    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown components={markdownStyles}>
          {displayContent + (shouldTruncate && !isExpanded ? '...' : '')}
        </ReactMarkdown>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {error && <ErrorMessage message={error} />}

      {type === 'system' ? renderScenarioSection() : renderFeedbackSection()}

      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {type === 'system' ? 'Existing System Prompts' : 'Existing Feedback Prompts'}
      </h4>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-6 w-full">
          {prompts.map((prompt: PromptWithDetails) => (
            <div key={prompt.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Prompt ID: {prompt.id}
                </span>
              </div>
              {editingId === prompt.id ? (
                <div className="space-y-4">
                  {type === 'system' && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        System Details
                      </label>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Prompt Content
                    </label>
                    <Input
                      type="textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  
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
                </div>
              ) : (
                <>
                  <TruncatedMarkdown content={prompt.content} />
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="options"
                      text="Edit"
                      onClick={() => handleEdit(prompt)}
                    />
                    <Button
                      variant="destructive"
                      text="Delete"
                      onClick={() => handleDeleteClick(prompt.id)}
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
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Prompt"
        footer={
          <div className="flex justify-end space-x-4">
            <Button 
              variant="default" 
              text="Cancel" 
              onClick={() => setShowDeleteModal(false)} 
            />
            <Button
              variant="destructive"
              text="Delete"
              onClick={handleDeleteConfirm}
              disabled={loading}
            />
          </div>
        }
      >
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this prompt? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export const SiteAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title="Site Admin - System Prompts" variant="alt" />
      <div className="flex-grow w-full max-w-4xl mx-auto p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">System Prompt Management</h1>
        
        <Tabs defaultValue="system" className="w-full">
          <TabsList>
            <TabsTrigger value="system">System Prompts</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Prompts</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <PromptManager type="system" />
          </TabsContent>
          <TabsContent value="feedback">
            <PromptManager type="feedback" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
