"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, LoadingSpinner } from "@/components/ui";
import axios from "axios";
import { PromptData, PromptWithDetails } from "@/types/prompt";

async function getFeedbackPrompts(): Promise<PromptData[]> {
  const response = await axios.get<PromptData[]>("/api/prompts/feedback");
  return response.data;
}

async function getSystemPrompts(): Promise<PromptWithDetails[]> {
  const response = await axios.get<PromptWithDetails[]>("/api/prompts/system");
  return response.data;
}

async function getPersonaPrompts(): Promise<PromptData[]> {
  const response = await axios.get<PromptData[]>("/api/prompts/persona");
  return response.data;
}
async function updatePrompt(id: number, type: "system" | "feedback" | "persona", content: string) {
  const response = await axios.patch(`/api/prompts/${id}`, { type, content });
  return response.data;
}

interface PromptManagerProps {
  type: "system" | "feedback" | "persona";
}

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{message}</div>
);

// Update template variables based on SQL schema
const AVAILABLE_VARIABLES = {
  scenario: [
    { name: "title", description: "The scenario title" },
    { name: "description", description: "The scenario description" },
    { name: "context", description: "The scenario context" },
    { name: "objectives", description: "The scenario objectives" },
  ],
  persona: [
    { name: "name", description: "Persona name" },
    { name: "age", description: "Persona age" },
    { name: "job", description: "Persona job title" },
    { name: "workplace", description: "Place of work" },
    { name: "emotional_conditions", description: "Emotional conditions" },
    { name: "major_issues_in_workplace", description: "Workplace issues" },
    { name: "personality_traits", description: "Personality traits" },
    { name: "segment", description: "Demographic segment" },
    { name: "uk_party_affiliation", description: "Political affiliation" },
    { name: "family_status", description: "Family status" },
    { name: "busyness_level", description: "Busyness level" },
  ],
  generation: [
    { name: "name", description: "Pre-generated name" },
    { name: "segment", description: "Pre-generated segment type" },
    { name: "age", description: "Pre-generated age" },
    { name: "gender", description: "Pre-generated gender" },
    { name: "family_status", description: "Pre-generated family status" },
    { name: "uk_party_affiliation", description: "Pre-generated political affiliation" },
    { name: "workplace", description: "Pre-generated workplace" },
    { name: "job", description: "Pre-generated job title" },
    { name: "busyness_level", description: "Pre-generated busyness level" },
    { name: "major_issues_in_workplace", description: "Pre-generated major issues in workplace" },
    { name: "personality_traits", description: "Pre-generated personality traits" },
    { name: "emotional_conditions", description: "Pre-generated emotional conditions" },
  ],
};

// Update the variables section in renderScenarioSection
const renderVariableStatus = (content: string, variables: Array<{ name: string; description: string }>) => (
  <div className="space-y-2">
    {variables.map(({ name, description }) => {
      const variable = `{{${name}}}`;
      const isUsed = content.includes(variable);
      const isLongVariable = name.length > 20;

      return (
        <div key={name} className={`flex ${isLongVariable ? "items-start" : "items-center"} space-x-2`}>
          <div
            className={`w-2 h-2 rounded-full ${isLongVariable ? "mt-1.5" : ""} flex-shrink-0 ${
              isUsed ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <div className={`${isLongVariable ? "flex-1 min-w-0" : ""}`}>
            <code
              className={`text-sm ${isLongVariable ? "break-all" : ""} ${
                isUsed ? "text-green-700 dark:text-green-400" : "text-gray-500"
              }`}>
              {variable}
            </code>
            <span className={`text-sm text-gray-600 dark:text-gray-400 ${isLongVariable ? "block" : "ml-2"}`}>
              - {description}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

const PromptManager: React.FC<PromptManagerProps> = ({ type }) => {
  const [promptContent, setPromptContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch the single prompt on component mount
  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    try {
      let prompt: PromptData[] | PromptWithDetails[];
      switch (type) {
        case "system":
          prompt = await getSystemPrompts();
          break;
        case "feedback":
          prompt = await getFeedbackPrompts();
          break;
        case "persona":
          prompt = await getPersonaPrompts();
          break;
        default:
          prompt = [];
      }
      // Handle both single object and array cases
      const content = prompt.length > 0 ? prompt[0].content : "";
      setPromptContent(content);
      setOriginalContent(content);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      setError("Failed to load prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  // Track changes to prompt content
  useEffect(() => {
    setHasUnsavedChanges(promptContent !== originalContent);
  }, [promptContent, originalContent]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming the API returns the prompt ID in the initial fetch
      const promptId = 1; // This should come from your API
      await updatePrompt(promptId, type, promptContent);
      setOriginalContent(promptContent);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving prompt:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setPromptContent(originalContent);
    setHasUnsavedChanges(false);
  };

  // Modified render functions to work with single prompt
  const renderPromptSection = () => (
    <div className="space-y-4 mb-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {type === "system" && "System Prompt"}
            {type === "feedback" && "Feedback Prompt"}
            {type === "persona" && "Persona Generation Prompt"}
          </h2>
          <div className="flex space-x-2">
            {hasUnsavedChanges && (
              <>
                <Button onClick={handleDiscard} disabled={loading}>
                  Discard
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Variables/Guidelines */}
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
              {type === "system" && (
                <>
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-4">Available Variables</h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Scenario Variables</h4>
                    {renderVariableStatus(promptContent, AVAILABLE_VARIABLES.scenario)}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Persona Variables</h4>
                    {renderVariableStatus(promptContent, AVAILABLE_VARIABLES.persona)}
                  </div>
                </>
              )}

              {type === "feedback" && (
                <>
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Feedback Guidelines</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Be specific and actionable</li>
                      <li>Balance positive feedback with areas for improvement</li>
                      <li>Focus on communication techniques</li>
                      <li>Consider persuasion effectiveness</li>
                      <li>Address handling of objections</li>
                    </ul>
                  </div>
                </>
              )}

              {type === "persona" && (
                <>
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Available Variables</h3>
                  {renderVariableStatus(promptContent, AVAILABLE_VARIABLES.generation)}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Prompt Input */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Content</label>
            </div>
            <div className="flex-grow h-full min-h-[400px]">
              <Input
                type="textarea"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="w-full h-full resize-none"
                placeholder="Enter your prompt..."
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : renderPromptSection()}
    </div>
  );
};

// Update the SiteAdmin component to use the modified PromptManager
export const SiteAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title="Site Admin - Prompts" variant="alt" />
      <div className="flex-grow w-full max-w-4xl mx-auto p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Prompt Management</h1>

        <Tabs defaultValue="system" className="w-full">
          <TabsList>
            <TabsTrigger value="system">System Prompt</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Prompt</TabsTrigger>
            <TabsTrigger value="persona">Persona Prompt</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <PromptManager type="system" />
          </TabsContent>
          <TabsContent value="feedback">
            <PromptManager type="feedback" />
          </TabsContent>
          <TabsContent value="persona">
            <PromptManager type="persona" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
