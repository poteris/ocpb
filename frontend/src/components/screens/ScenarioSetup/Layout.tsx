import React from 'react';
import ScenarioFooter from './ScenarioFooter';

interface ScenarioSetupLayoutProps {
    children: React.ReactNode;
    onStartChat?: () => void;
    isLoading?: boolean;
}

const ScenarioSetupLayout: React.FC<ScenarioSetupLayoutProps> = ({ children, onStartChat, isLoading = false }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow overflow-y-auto scrollbar-hide">
                {children}
            </main>
            {!isLoading && <ScenarioFooter onStartChat={onStartChat || (() => {})} />}
        </div>
    );
};

export default ScenarioSetupLayout;

