import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Welcome } from '@/components/screens/Welcome/WelcomePage';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import '@testing-library/jest-dom';

jest.mock('axios');

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// for testing global state
jest.mock('jotai', () => {
    const actualJotai = jest.requireActual('jotai');
    return {
        ...actualJotai,
        useAtom: jest.fn(),
    };
});


const welcomePageTitle = 'Welcome to the Union Training Bot';

describe('Welcome Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });

        (useAtom as jest.Mock).mockReturnValue([null, jest.fn()]);

        jest.clearAllMocks();
        // Suppress console.error output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    // Restore console.error
    afterEach(() => {
        jest.restoreAllMocks();
      });

    it("renders the main header", async () => {

        (axios.get as jest.Mock).mockResolvedValue({ data: [] });

        render(<Welcome />);

        await waitFor(() => {

            expect(
                screen.getByRole("heading", { name: welcomePageTitle })
            ).toBeInTheDocument();
        });
    });

    it('fetches scenarios on mount and displays them', async () => {
        const mockScenarios = [
            {
                id: '1',
                title: 'Scenario One',
                description: 'First scenario',
            },
            {
                id: '2',
                title: 'Scenario Two',
                description: 'Second scenario',
            },
        ];

        const scenarioTitleOne = 'Scenario One';
        const scenariosTitleTwo = 'Scenario Two';

        (axios.get as jest.Mock).mockResolvedValue({ data: mockScenarios });

        render(<Welcome />);


        expect(await screen.findByText(scenarioTitleOne)).toBeInTheDocument();
        expect(screen.getByText(scenariosTitleTwo)).toBeInTheDocument();
    });

    it('displays no scenario cards if no scenarios are returned', async () => {
      
        (axios.get as jest.Mock).mockResolvedValue({ data: [] });

        render(<Welcome />);

        await waitFor(() => {

            const scenarioCards = screen.queryAllByText(/Start Scenario/i);
            expect(scenarioCards).toHaveLength(0);
        });
    });


    // Test context management: scenario selection sets the jotai scenarioAtom, this can be used throughout the app
    it('sets the scenarioAtom when "Start Scenario" is clicked', async () => {
        const mockScenarios = [
            {
                id: '1',
                title: 'Scenario One',
                description: 'First scenario',
            },
        ];

        (axios.get as jest.Mock).mockResolvedValue({ data: mockScenarios });

        const mockSetScenario = jest.fn();
        // returns null for the current value of the atom, the value is updated by the setter
        (useAtom as jest.Mock).mockReturnValue([null, mockSetScenario]);

        render(<Welcome />);

        expect(await screen.findByText(/Scenario One/i)).toBeInTheDocument();
        const startButton = /Start Scenario/i;

        fireEvent.click(screen.getByText(startButton));

        // Check if the setter was called with the matching scenario object
        expect(mockSetScenario).toHaveBeenCalledWith({
            id: '1',
            title: 'Scenario One',
            description: 'First scenario',
        });
    });


    it('navigates to the scenario setup page on "Start Scenario"', async () => {
        const mockScenarios = [
            {
                id: 'mock-scenario',
                title: 'Scenario One',
                description: 'First scenario',
            },
        ];

        (axios.get as jest.Mock).mockResolvedValue({ data: mockScenarios });

        // Capture the router mock
        const mockedPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockedPush,
        });

        render(<Welcome />);

        expect(await screen.findByText(/Scenario One/i)).toBeInTheDocument();

        // onClick event "Start Scenario" button
        fireEvent.click(screen.getByText(/Start Scenario/i));

        const mockScenarioId = mockScenarios[0].id;

        // push was called with the correct route
        expect(mockedPush).toHaveBeenCalledWith(`/scenario-setup?scenarioId=${mockScenarioId}`);
    });

    it('handles errors gracefully if API call fails', async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

        render(<Welcome />);
        await waitFor(() => {
            const scenarioCards = screen.queryAllByText(/Start Scenario/i);
            expect(scenarioCards).toHaveLength(0);
        });
    });
});
