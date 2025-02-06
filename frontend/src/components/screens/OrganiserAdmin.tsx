"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, Modal } from "@/components/ui";
import { slugify } from "@/utils/helpers";
import { TrainingScenario } from "@/types/scenarios";
import axios from "axios";
interface ScenarioForm {
  id: string;
  title: string;
  description: string;
  context: string;
  objectives: string[];
}

async function getScenarios() {
  const response = await axios.get<TrainingScenario[]>("/api/scenarios");
  return response.data;
}

async function createNewScenario(scenario: TrainingScenario) {
  const response = await axios.post<TrainingScenario>("/api/scenarios", scenario);
  return response.data;
}

async function updateScenarioDetails(
  id: string,
  updates: {
    title?: string;
    description?: string;
    context?: string;
    objectives?: string[];
  }
) {
  const response = await axios.patch(`/api/scenarios/${id}`, updates);
  return response.data;
}

async function deleteScenario(id: string) {
  const response = await axios.delete(`/api/scenarios/${id}`);

  return response.data;
}

export const OrganiserAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title="Admin - Scenarios" variant="alt" />
      <PromptManager type="scenario" />
    </div>
  );
};

const PromptManager: React.FC<{ type: "scenario" }> = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [scenarioForm, setScenarioForm] = useState<ScenarioForm>({
    id: "",
    title: "",
    description: "",
    context: "",
    objectives: [],
  });
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ScenarioForm | null>(null);
  const [deleteScenarioId, setDeleteScenarioId] = useState<string | null>(null);

  useEffect(() => {
    if (type === "scenario") {
      const fetchScenarios = async () => {
        // const scenarioData = await getScenarios();
        const scenarioData = await getScenarios();
        setScenarios(scenarioData);
      };
      fetchScenarios();
    }
  }, [type]);

  const generateScenarioId = (title: string) => {
    const baseSlug = slugify(title);
    const existingIds = scenarios.filter((s) => s.id.startsWith(baseSlug)).map((s) => s.id);

    if (existingIds.length === 0) return baseSlug;

    const numbers = existingIds.map((id) => {
      const match = id.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 1;
    });

    const nextNumber = Math.max(...numbers) + 1;
    return `${baseSlug}-${nextNumber}`;
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const renderScenarioSection = () => (
    <div className="space-y-4 border-b pb-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Scenario</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <Input
              type="text"
              value={scenarioForm.title}
              onChange={(e) => {
                const title = e.target.value;
                setScenarioForm((prev) => ({
                  ...prev,
                  title,
                  id: generateScenarioId(title),
                }));
              }}
              placeholder="e.g., Joining the Union"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <Input
              type="textarea"
              value={scenarioForm.description}
              onChange={(e) =>
                setScenarioForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="e.g., understand the benefits and process of joining a trade union"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Context</label>
            <Input
              type="textarea"
              value={scenarioForm.context}
              onChange={(e) =>
                setScenarioForm((prev) => ({
                  ...prev,
                  context: e.target.value,
                }))
              }
              placeholder="Provide background context for this scenario..."
            />
            <p className="text-sm text-gray-500 mt-1">This context will help frame the scenario for the AI.</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Template Preview</h3>
            <p className="text-sm text-blue-600 dark:text-blue-200 font-mono">
              Role play to help users to{" "}
              <span className="font-bold">{scenarioForm.description || "{{description}}"}</span>. The user is a trade
              union representative speaking to you about{" "}
              <span className="font-bold">{scenarioForm.title || "{{title}}"}</span>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Objectives
            </label>
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex flex-col space-y-2 w-full">
                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-gray-500 text-sm">{index + 1}.</span>
                    <Input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index] = e.target.value;
                        setObjectives(newObjectives);
                      }}
                      className="flex-grow"
                    />
                    <Button onClick={() => handleRemoveObjective(index)}>Remove</Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">{objectives.length + 1}.</span>
                <Input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                  placeholder="Enter a learning objective..."
                  className="flex-grow"
                />
                <Button onClick={handleAddObjective}>Add</Button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleCreateScenario} disabled={loading || objectives.length < 3} className="w-full">
              Create Scenario
            </Button>
            {objectives.length > 0 && objectives.length < 3 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 text-center">
                Add {3 - objectives.length} more objective{3 - objectives.length === 1 ? "" : "s"} to create
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const handleCreateScenario = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!scenarioForm.title || !scenarioForm.description) {
        setError("Please fill in all scenario fields");
        return;
      }
      if (objectives.length < 3) {
        setError("Please add at least 3 learning objectives");
        return;
      }
      const newScenario = { ...scenarioForm, objectives } as TrainingScenario;
      await createNewScenario(newScenario);

      setScenarioForm({
        id: "",
        title: "",
        description: "",
        context: "",
        objectives: [],
      });
      setObjectives([]);
      setNewObjective("");

      const scenarioData = await getScenarios();
      setScenarios(scenarioData);

      setError("Scenario created successfully!");
    } catch (error) {
      console.error("Create scenario error:", error);
      setError("Failed to create scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (scenario: TrainingScenario) => {
    setEditingScenarioId(scenario.id);
    setEditForm({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      context: scenario.context,
      objectives: scenario.objectives,
    });
  };

  const handleEditCancel = () => {
    setEditingScenarioId(null);
    setEditForm(null);
  };

  const handleEditSave = async (scenarioId: string) => {
    if (!editForm) return;

    try {
      setLoading(true);
      setError(null);

      if (editForm.objectives.length < 3) {
        setError("Please add at least 3 learning objectives");
        return;
      }

      await updateScenarioDetails(scenarioId, {
        title: editForm.title,
        description: editForm.description,
        context: editForm.context,
        objectives: editForm.objectives,
      });

      setEditingScenarioId(null);
      setEditForm(null);

      // Refresh scenarios
      const scenarioData = await getScenarios();
      setScenarios(scenarioData);

      setError("Scenario updated successfully!");
    } catch (error) {
      console.error("Edit scenario error:", error);
      setError("Failed to update scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateScenario = async (scenario: TrainingScenario) => {
    try {
      setLoading(true);

      // Create new ID for duplicated scenario
      const newId = generateScenarioId(scenario.title);

      // Create duplicate scenario with new ID
      await createNewScenario({
        ...scenario,
        id: newId,
        title: `${scenario.title} (Copy)`,
      });

      // Refresh scenarios
      const scenarioData = await getScenarios();
      setScenarios(scenarioData);
      setError("Scenario duplicated successfully!");
    } catch (error) {
      console.error("Duplicate scenario error:", error);
      setError("Failed to duplicate scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScenarioClick = (scenarioId: string) => {
    setDeleteScenarioId(scenarioId);
    setShowDeleteModal(true);
  };

  const handleDeleteScenarioConfirm = async () => {
    if (!deleteScenarioId) return;

    try {
      setLoading(true);
      await deleteScenario(deleteScenarioId);

      // Refresh scenarios
      const scenarioData = await getScenarios();
      setScenarios(scenarioData);
      setError("Scenario deleted successfully!");
    } catch (error) {
      console.error("Delete scenario error:", error);
      setError("Failed to delete scenario. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteScenarioId(null);
    }
  };

  const renderExistingScenarios = () => (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <div
          key={scenario.id}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {editingScenarioId === scenario.id ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">ID: {scenario.id}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <Input
                  type="text"
                  value={editForm?.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <Input
                  type="textarea"
                  value={editForm?.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Context</label>
                <Input
                  type="textarea"
                  value={editForm?.context}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev!,
                      context: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Template Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Template Preview</h3>
                <p className="text-sm text-blue-600 dark:text-blue-200 font-mono">
                  Role play to help users to <span className="font-bold">{editForm?.description}</span>. The user is a
                  trade union representative speaking to you about <span className="font-bold">{editForm?.title}</span>.
                </p>
                {(editForm?.title || editForm?.description) && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 italic">
                    ⚡ Make sure the title and description flow naturally in the sentence above
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Learning Objectives
                </label>
                <div className="space-y-2">
                  {editForm?.objectives.map((objective, index) => (
                    <div key={index} className="flex flex-col space-y-2 w-full">
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-gray-500 text-sm">{index + 1}.</span>
                        <Button
                          onClick={() => {
                            const newObjectives = editForm.objectives.filter((_, i) => i !== index);
                            setEditForm((prev) => ({
                              ...prev!,
                              objectives: newObjectives,
                            }));
                          }}
                          className="text-xs">
                          Remove
                        </Button>
                      </div>
                      <Input
                        type="text"
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...editForm.objectives];
                          newObjectives[index] = e.target.value;
                          setEditForm((prev) => ({
                            ...prev!,
                            objectives: newObjectives,
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      setEditForm((prev) => ({
                        ...prev!,
                        objectives: [...prev!.objectives, ""],
                      }))
                    }>
                    Add Objective
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {editForm && editForm.objectives.length < 3 ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Add {3 - editForm.objectives.length} more objective
                      {3 - editForm.objectives.length === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {editForm?.objectives.length} objectives added
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button onClick={handleEditCancel}>Cancel</Button>
                <Button onClick={() => handleEditSave(scenario.id)} disabled={loading}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            // Updated View Mode
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{scenario.title}</h3>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">ID: {scenario.id}</span>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditClick(scenario)}>Edit</Button>
                  <Button onClick={() => handleDuplicateScenario(scenario)}>Duplicate</Button>
                  <Button onClick={() => handleDeleteScenarioClick(scenario.id)}>Delete</Button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">{scenario.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Context:</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{scenario.context}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Objectives:</h4>
                {scenario.objectives.map((objective, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400 pl-4">
                    {index + 1}. {objective}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Scenario"
        footer={
          <div className="flex justify-end space-x-4">
            <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button onClick={handleDeleteScenarioConfirm} disabled={loading}>
              Delete
            </Button>
          </div>
        }>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this scenario? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Scenario Management</h1>

      {error && (
        <div
          className={`p-4 rounded-md mb-4 ${
            error.toLowerCase().includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {error}
        </div>
      )}

      <Tabs defaultValue="existing" className="w-full">
        <TabsList>
          <TabsTrigger value="existing">Your Scenarios</TabsTrigger>
          <TabsTrigger value="new">New Scenario</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">{renderExistingScenarios()}</TabsContent>

        <TabsContent value="new">{renderScenarioSection()}</TabsContent>
      </Tabs>
    </div>
  );
};
