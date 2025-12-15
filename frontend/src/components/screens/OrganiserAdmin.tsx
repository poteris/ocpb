"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, Modal, ColorPicker } from "@/components/ui";
import { slugify } from "@/utils/helpers";
import { TrainingScenario } from "@/types/scenarios";
import { useTenant } from "@/context/TenantContext";
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
  const { organisationId } = useTenant();
  
  return (
    <div className="flex flex-col h-full bg-white">
      <Header title={`Admin - Scenarios (${organisationId})`} variant="alt" />
      <PromptManager type="scenario" />
    </div>
  );
};

const PromptManager: React.FC<{ type: "scenario" }> = ({ type }) => {
  const { organisationId, branding, updateBranding } = useTenant();
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
  
  // Branding state
  const [brandingForm, setBrandingForm] = useState({
    logoUrl: branding.logoUrl || "",
    primaryColor: branding.primaryColor,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

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

  // Sync branding form with context when branding changes
  useEffect(() => {
    setBrandingForm({
      logoUrl: branding.logoUrl || "",
      primaryColor: branding.primaryColor,
    });
  }, [branding]);

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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Scenario</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
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

          <div className="bg-blue-50 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Template Preview</h3>
            <p className="text-sm text-blue-600 font-mono">
              Role play to help users to{" "}
              <span className="font-bold">{scenarioForm.description || "{{description}}"}</span>. The user is a trade
              union representative speaking to you about{" "}
              <span className="font-bold">{scenarioForm.title || "{{title}}"}</span>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-sm text-amber-600 mt-2 text-center">
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

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setBrandingForm(prev => ({ ...prev, logoUrl: data.logoUrl }));
        setLogoFile(null);
        setError('Logo uploaded successfully!');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = () => {
    setBrandingForm(prev => ({ ...prev, logoUrl: '' }));
    setError('Logo removed. Click "Save Branding Changes" to apply.');
  };

  const handleSaveBranding = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/organizations/${organisationId}/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl: brandingForm.logoUrl,
          primaryColor: brandingForm.primaryColor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateBranding({
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
        });
        setError('Branding updated successfully!');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update branding');
      }
    } catch (error) {
      console.error('Branding update error:', error);
      setError('Failed to update branding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBrandingSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Branding</h2>
        
        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Logo
            </label>
            <div className="flex items-center space-x-4">
              {brandingForm.logoUrl && (
                <div className="w-16 h-16 rounded-lg border-2 border-gray-300 overflow-hidden">
                  <Image
                    src={brandingForm.logoUrl}
                    alt="Current logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/bot-avatar.svg";
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                  onChange={handleLogoFileChange}
                  className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, SVG (max 5MB)
                </p>
                <div className="flex space-x-2 mt-2">
                  {logoFile && (
                    <Button 
                      onClick={handleUploadLogo} 
                      disabled={loading}
                    >
                      Upload Logo
                    </Button>
                  )}
                  {brandingForm.logoUrl && (
                    <Button 
                      onClick={handleRemoveLogo} 
                      disabled={loading}
                      variant="outline"
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Logo URL Display */}
          {brandingForm.logoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Logo URL
              </label>
              <Input
                type="text"
                value={brandingForm.logoUrl}
                onChange={(e) => setBrandingForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can also manually enter a logo URL
              </p>
            </div>
          )}

          {/* Colour Customization */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <ColorPicker
              label="Primary Colour"
              value={brandingForm.primaryColor}
              onChange={(color) => setBrandingForm(prev => ({ ...prev, primaryColor: color }))}
              disabled={loading}
            />
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div 
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: brandingForm.primaryColor }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20">
                  <Image
                    src={brandingForm.logoUrl || "/images/bot-avatar.svg"}
                    alt="Logo preview"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/bot-avatar.svg";
                    }}
                  />
                </div>
                <h4 className="font-semibold">Union Training Bot</h4>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: brandingForm.primaryColor }}
                title={`Primary: ${brandingForm.primaryColor}`}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSaveBranding} 
              disabled={loading}
              className="w-full"
            >
              Save Branding Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExistingScenarios = () => (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <div
          key={scenario.id}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {editingScenarioId === scenario.id ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-gray-500">ID: {scenario.id}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
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

              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Template Preview</h3>
                <p className="text-sm text-blue-600 font-mono">
                  Role play to help users to <span className="font-bold">{editForm?.description}</span>. The user is a
                  trade union representative speaking to you about <span className="font-bold">{editForm?.title}</span>.
                </p>
                {(editForm?.title || editForm?.description) && (
                  <p className="text-xs text-blue-600 mt-2 italic">
                    ⚡ Make sure the title and description flow naturally in the sentence above
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <p className="text-sm text-gray-500 mt-2">
                  {editForm && editForm.objectives.length < 3 ? (
                    <span className="text-amber-600">
                      Add {3 - editForm.objectives.length} more objective
                      {3 - editForm.objectives.length === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-green-600">
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
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{scenario.title}</h3>
                  <span className="text-xs font-mono text-gray-500">ID: {scenario.id}</span>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditClick(scenario)}>Edit</Button>
                  <Button onClick={() => handleDuplicateScenario(scenario)}>Duplicate</Button>
                  <Button onClick={() => handleDeleteScenarioClick(scenario.id)}>Delete</Button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{scenario.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Context:</h4>
                <p className="text-gray-600 text-sm">{scenario.context}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700">Learning Objectives:</h4>
                {scenario.objectives.map((objective, index) => (
                  <div key={index} className="text-sm text-gray-600 pl-4">
                    {index + 1}. {objective}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

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
        <p className="text-lg text-gray-700">
          Are you sure you want to delete this scenario? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Scenario Management</h1>

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
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">{renderExistingScenarios()}</TabsContent>
        <TabsContent value="new">{renderScenarioSection()}</TabsContent>
        <TabsContent value="branding">{renderBrandingSection()}</TabsContent>
      </Tabs>
    </div>
  );
};
