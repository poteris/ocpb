'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { getScenarioPrompts, getPersonaPrompts, getFeedbackPrompts, updatePrompt, createPrompt, deletePrompt, Prompt, getScenarios, Scenario, createScenarioWithObjectives} from '@/utils/supabaseQueries';
import { Modal } from '@/components/ui';
import { slugify } from '@/utils/helpers';

interface ScenarioForm {
  id: string;
  title: string;
  description: string;
  objectives: string[];
}

const PromptManager: React.FC<{ type: 'scenario' | 'persona' | 'feedback' }> = ({ type }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isNewScenario, setIsNewScenario] = useState(false);
  const [scenarioForm, setScenarioForm] = useState<ScenarioForm>({
    id: '',
    title: '',
    description: '',
    objectives: []
  });
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, [type]);

  useEffect(() => {
    if (type === 'scenario') {
      const fetchScenarios = async () => {
        const scenarioData = await getScenarios();
        setScenarios(scenarioData);
      };
      fetchScenarios();
    }
  }, [type]);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      setPrompts(fetchedPrompts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      setError(`Failed to fetch prompts. ${err}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [type]);

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

  const generateScenarioId = (title: string) => {
    const baseSlug = slugify(title);
    const existingIds = scenarios
      .filter(s => s.id.startsWith(baseSlug))
      .map(s => s.id);
    
    if (existingIds.length === 0) return baseSlug;
    
    const numbers = existingIds
      .map(id => {
        const match = id.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 1;
      });
    
    const nextNumber = Math.max(...numbers) + 1;
    return `${baseSlug}-${nextNumber}`;
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const renderScenarioSection = () => (
    <div className="space-y-4 border-b pb-6 mb-6">
      {/* Step 1: Choose Scenario */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Step 1: Choose Scenario
        </h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant={isNewScenario ? "progress" : "default"}
            text="Create New Scenario"
            onClick={() => setIsNewScenario(true)}
          />
          <Button
            variant={!isNewScenario ? "progress" : "default"}
            text="Use Existing Scenario"
            onClick={() => setIsNewScenario(false)}
          />
        </div>

        {isNewScenario ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <Input
                type="text"
                value={scenarioForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setScenarioForm(prev => ({
                    ...prev,
                    title,
                    id: generateScenarioId(title)
                  }));
                }}
                placeholder="e.g., Joining the Union"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Input
                type="textarea"
                rows={2}
                value={scenarioForm.description}
                onChange={(e) => setScenarioForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="e.g., understand the benefits and process of joining a trade union"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Generated ID (editable)
              </label>
              <Input
                type="text"
                value={scenarioForm.id}
                onChange={(e) => setScenarioForm(prev => ({
                  ...prev,
                  id: e.target.value
                }))}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Learning Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="flex-grow p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {objective}
                    </span>
                    <Button
                      variant="destructive"
                      text="Remove"
                      onClick={() => handleRemoveObjective(index)}
                      className="text-xs"
                    />
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Enter a learning objective..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                  />
                  <Button
                    variant="options"
                    text="Add"
                    onClick={handleAddObjective}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                const scenario = scenarios.find(s => s.id === e.target.value);
                setSelectedScenarioId(e.target.value);
                if (scenario) {
                  setScenarioForm({
                    id: scenario.id,
                    title: scenario.title,
                    description: scenario.description,
                    objectives: scenario.objectives
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select a scenario...</option>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Step 2: Create Prompt */}
      {(isNewScenario || selectedScenarioId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Step 2: Create Prompt
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Template info */}
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Your Scenario Details
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    <p className="font-medium">Title:</p>
                    <p className="ml-4">{scenarioForm.title || "Not set"}</p>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    <p className="font-medium">Description:</p>
                    <p className="ml-4">{scenarioForm.description || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Variables
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li><code>{'{{title}}'}</code> - The scenario title</li>
                  <li><code>{'{{description}}'}</code> - The scenario description</li>
                </ul>
              </div>
            </div>

            {/* Right column: Prompt creation */}
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                    Default Template
                  </h3>
                  <Button
                    variant="options"
                    text="Use Template"
                    onClick={() => setNewPromptContent(
                      "Role play to help users to {{description}}. The user is a trade union representative speaking to you about {{title}}. Respond as their workplace colleague in the character below. Do not break character. This is an informal interaction. Keep your responses brief. Emphasise your character's feelings about joining a union. It should be a challenge for the user to persuade you. It's VITAL that the user has a REALISTIC experience of being in a workplace to adequately prepare them for what they might encounter. Failure to train them for the difficult interactions they will face in real life will be harmful for them."
                    )}
                    className="text-xs"
                  />
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
                  className="w-full mb-2"
                  rows={5}
                  placeholder="Enter your prompt using the template variables above..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Add Submit Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Ready to create?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isNewScenario ? 
                    "This will create both a new scenario and its first prompt." :
                    "This will add a new prompt to the existing scenario."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="default"
                  text="Clear All"
                  onClick={() => {
                    setNewPromptContent('');
                    setSelectedScenarioId('');
                    setScenarioForm({ id: '', title: '', description: '', objectives: [] });
                    setIsNewScenario(false);
                  }}
                />
                <Button
                  variant="progress"
                  text={isNewScenario ? "Create Scenario & Prompt" : "Add Prompt"}
                  onClick={handleAdd}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Add validation hints */}
            {(isNewScenario || selectedScenarioId) && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    newPromptContent.includes('{{title}}') && newPromptContent.includes('{{description}}')
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`} />
                  <span className={
                    newPromptContent.includes('{{title}}') && newPromptContent.includes('{{description}}')
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-500'
                  }>
                    Prompt includes both template variables
                  </span>
                </div>
                {isNewScenario && (
                  <>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        scenarioForm.title && scenarioForm.description
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`} />
                      <span className={
                        scenarioForm.title && scenarioForm.description
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-500'
                      }>
                        Scenario title and description provided
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        scenarioForm.id ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className={
                        scenarioForm.id
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-500'
                      }>
                        Valid scenario ID
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const handleAdd = async () => {
    setValidationError(null);
    setLoading(true);
    
    try {
      if (!newPromptContent.trim()) {
        setValidationError('Please enter prompt content');
        return;
      }

      if (!newPromptContent.includes('{{title}}') || !newPromptContent.includes('{{description}}')) {
        setValidationError('Prompt must include both {{title}} and {{description}} variables');
        return;
      }

      if (type === 'scenario') {
        if (isNewScenario) {
          if (!scenarioForm.title || !scenarioForm.description || !scenarioForm.id) {
            setValidationError('Please fill in all scenario fields');
            return;
          }
          if (objectives.length === 0) {
            setValidationError('Please add at least one learning objective');
            return;
          }
          // Create scenario with objectives
          await createScenarioWithObjectives({
            ...scenarioForm,
            objectives
          });
          setSelectedScenarioId(scenarioForm.id);
        }

        if (!selectedScenarioId) {
          setValidationError('Please select or create a scenario');
          return;
        }

        await createPrompt(type, newPromptContent, selectedScenarioId);
      } else {
        await createPrompt(type, newPromptContent);
      }

      // Reset form
      setNewPromptContent('');
      setSelectedScenarioId('');
      setScenarioForm({ id: '', title: '', description: '', objectives: [] });
      setIsNewScenario(false);
      await fetchPrompts();
    } catch (err) {
      setError(`Failed to create prompt. ${err}Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      setError(`Failed to delete prompt. ${err} Please try again.`);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletePromptId(null);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {validationError}
        </div>
      )}

      {type === 'scenario' ? renderScenarioSection() : (
        <div className="mb-6 space-y-4">
          <Input
            type="textarea"
            value={newPromptContent}
            onChange={(e) => setNewPromptContent(e.target.value)}
            className="w-full mb-2"
            rows={3}
            placeholder={`Enter new ${type} prompt`}
            required
          />
          <Button
            variant="progress"
            text={`Add New ${type.charAt(0).toUpperCase() + type.slice(1)} Prompt`}
            onClick={handleAdd}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-6 w-full">
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
      <Header title="Admin - Prompts" variant="alt" />
      <div className="flex-grow w-full max-w-4xl mx-auto p-6 overflow-y-auto">
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
