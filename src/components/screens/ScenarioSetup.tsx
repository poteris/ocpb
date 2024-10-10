import React from 'react';
import { Layout } from '../Layout';
import { Button } from '../ui';
import { useRouter } from '@/utils/router';

export const ScenarioSetup: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-grow max-w-2xl mx-auto p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4">Grievance Handling Scenario</h1>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Scenario Description</h2>
            <p>
              In this scenario, you'll practice handling a grievance from a union member
              regarding unfair treatment in the workplace.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Role</h2>
            <p>
              You are a union representative tasked with listening to the member's
              complaint and determining the best course of action.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">Objectives</h2>
            <ul className="list-disc list-inside">
              <li>Gather all relevant information from the member</li>
              <li>Identify any potential violations of the collective agreement</li>
              <li>Determine appropriate next steps (e.g., informal resolution, formal grievance)</li>
              <li>Communicate effectively with the member throughout the process</li>
            </ul>
          </section>
        </div>
        <footer className="bg-pcsprimary02-light p-4">
          <div className="max-w-2xl mx-auto flex space-x-4">
            <Button
              variant="options"
              text="Change Persona"
              onClick={() => console.log('Change persona clicked')}
              className="flex-1"
            />
            <Button
              variant="progress"
              text="Start Chat"
              onClick={() => navigateTo('initiateChat')}
              className="flex-1"
            />
          </div>
        </footer>
      </div>
    </Layout>
  );
};