import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui';
import { useRouter } from '@/utils/router';

const scenarios = [
  'Grievance Handling',
  'Collective Bargaining',
  'Workplace Safety',
  'Member Representation',
  'Union Leadership',
];

export const Welcome: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <Layout headerType="alt">
      <div className="flex flex-col h-full">
        <div className="flex-grow max-w-2xl mx-auto p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4">Welcome to Union Training Bot</h1>
          <p className="mb-6">
            Select a training scenario to begin your interactive learning experience:
          </p>
          <ul className="space-y-4">
            {scenarios.map((scenario, index) => (
              <li key={index}>
                <Button
                  variant="options"
                  text={scenario}
                  onClick={() => navigateTo('scenarioSetup')}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </div>
        <footer className="bg-pcsprimary02-light p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="progress"
              text="Create an Account"
              onClick={() => console.log('Create account clicked')}
              className="w-full"
            />
          </div>
        </footer>
      </div>
    </Layout>
  );
};