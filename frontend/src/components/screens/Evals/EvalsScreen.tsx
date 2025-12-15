"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui";
import { Organization, EvalConversation, KPIData } from "@/types/evals";
import { KPIDashboard } from "./KPIDashboard";
import { ConversationBrowser } from "./ConversationBrowser";
import { BasicAnalytics } from "./BasicAnalytics";
import { PasswordProtection } from "./PasswordProtection";

async function fetchOrganizations(): Promise<Organization[]> {
  const response = await fetch("/api/evals/organizations");
  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return response.json();
}

async function fetchConversations(filters: {
  organizationId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<EvalConversation[]> {
  const params = new URLSearchParams();
  if (filters.organizationId) params.append('organizationId', filters.organizationId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await fetch(`/api/evals/conversations?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

function calculateKPIs(conversations: EvalConversation[]): KPIData {
  const totalConversations = conversations.length;
  
  const averageConversationLength = totalConversations > 0
    ? conversations.reduce((sum, c) => sum + c.message_count, 0) / totalConversations
    : 0;

  return {
    totalConversations,
    averageConversationLength
  };
}

const EvalsScreenContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [, setConversations] = useState<EvalConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<EvalConversation[]>([]);
  
  // Filters
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Calculate default date range (last 1 year)
  useEffect(() => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [orgsData] = await Promise.all([
          fetchOrganizations()
        ]);
        setOrganizations(orgsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch conversations when filters change
  useEffect(() => {
    if (!startDate || !endDate) return;
    
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchConversations({
          organizationId: selectedOrg === 'all' ? undefined : selectedOrg,
          startDate,
          endDate
        });
        setConversations(data);
        setFilteredConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [selectedOrg, startDate, endDate]);

  const kpiData = calculateKPIs(filteredConversations);

  const handleExportData = () => {
    const csvData = filteredConversations.map(conv => ({
      conversation_id: conv.conversation_id,
      organization: conv.organization_name,
      scenario: conv.scenario.title,
      persona: conv.persona.name,
      message_count: conv.message_count,
      feedback_score: conv.feedback_score,
      created_at: conv.created_at,
      has_feedback: conv.has_feedback,
      assertions_passed: conv.assertion_summary?.passed || 0,
      assertions_failed: conv.assertion_summary?.failed || 0,
      assertions_total: conv.assertion_summary?.total || 0,
      human_rating: conv.human_rating || '',
      human_notes: conv.human_notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-evals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <Header title="Evaluation Dashboard" variant="alt" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error loading data</div>
            <div className="text-gray-600">{error}</div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Evaluation Dashboard" variant="alt" />
      
      <div className="flex-grow overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="flex-1 min-w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <Button onClick={handleExportData} variant="outline">
                Export CSV
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* KPI Dashboard */}
              <KPIDashboard data={kpiData} />
              
              {/* Basic Analytics */}
              <BasicAnalytics conversations={filteredConversations} />
              
              {/* Conversation Browser */}
              <ConversationBrowser 
                conversations={filteredConversations}
                onConversationsChange={setFilteredConversations}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const EvalsScreen: React.FC = () => {
  return (
    <PasswordProtection>
      <EvalsScreenContent />
    </PasswordProtection>
  );
};
