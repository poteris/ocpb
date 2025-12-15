"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { KPIData } from "@/types/evals";

interface KPIDashboardProps {
  data: KPIData;
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
}> = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900"
  };

  return (
    <Card className={`p-6 ${colorClasses[color as keyof typeof colorClasses]} border-2`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-20">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Removed unused ScoreGauge component

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ data }) => {
  const {
    totalConversations,
    averageConversationLength
  } = data;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Total Conversations"
          value={totalConversations.toLocaleString()}
          icon="💬"
          color="blue"
        />
        
        <KPICard
          title="Avg Conversation Length"
          value={averageConversationLength.toFixed(1)}
          subtitle="messages per conversation"
          icon="📏"
          color="orange"
        />
      </div>
    </div>
  );
};
