import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScenarioSetup } from "@/components/screens/ScenarioSetup/ScenarioSetup";
import { useRouter } from "next/navigation";
import axios from "axios";
import { scenarioAtom, selectedPersonaAtom } from "@/store";
import { useAtom } from "jotai";
import { mockPersona, mockTrainingScenario } from "../__mocks__/mockData";


jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("axios");

jest.mock("jotai", () => ({
  ...jest.requireActual("jotai"),
  useAtom: jest.fn(),
}));



describe("ScenarioSetup Component", () => {
  const mockUseRouter = useRouter as jest.Mock;
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockUseAtom = useAtom as jest.Mock;

  const mockPush = jest.fn();
  const mockBack = jest.fn();


  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the return value of useRouter
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    });

    // By default, scenarioAtom returns a scenario object
    mockUseAtom.mockImplementation((atom) => {
      if (atom === scenarioAtom) {
        return [mockTrainingScenario, jest.fn()];
      }
      if (atom === selectedPersonaAtom) {
        return [null, jest.fn()];
      }
      return [null, jest.fn()];
    });

    // Mock axios.get for persona generation
    mockAxios.get.mockResolvedValue({
      data: mockPersona,
    });
  });

  test("Renders scenario title if available", async () => {
    render(<ScenarioSetup scenarioId="test-scenario-id" />);

    expect(await screen.findByText("The Official Loony Party Recruitment Drive")).toBeInTheDocument();
  });

  test("Calls generatePersona on mount if no currentPersona", async () => {
    render(<ScenarioSetup scenarioId="test-scenario-id" />);

    // Wait for persona fetch
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        "/api/persona/generate-new-persona"
      );
    });
  });

  test("Displays Persona Details once persona is loaded", async () => {
    render(<ScenarioSetup scenarioId="test-scenario-id" />);

    const personaName = await screen.findByText(mockPersona.name);
    expect(personaName).toBeInTheDocument();
    expect(screen.getByText(mockTrainingScenario.description)).toBeInTheDocument();
  });

    test('Generates a new persona on "Generate New Persona" button click', async () => {
      render(<ScenarioSetup scenarioId="test-scenario-id" />);

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith('/api/persona/generate-new-persona');
      });
      mockAxios.get.mockClear();

      // Click "Generate New Persona" button
      const generateBtn = await screen.findByText('Generate New Persona');
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith('/api/persona/generate-new-persona');
      });
    });

    test('"Start Chat" button navigates to the correct route', async () => {
      render(<ScenarioSetup scenarioId="test-scenario-id" />);

      await screen.findByText(mockPersona.name);

      // Click on "Start Chat with Current Persona" button
      const startChatBtn = screen.getByText('Start Chat with Current Persona');
      fireEvent.click(startChatBtn);

      await waitFor(() => {
      
        expect(mockPush).toHaveBeenCalledWith(`/initiate-chat?scenarioId=${mockTrainingScenario.id}`);
      });
    });

    test('Button is disabled while loading or navigating', async () => {

      render(<ScenarioSetup scenarioId="test-scenario-id" />);

      // Initially, persona is loading, so button should be disabled
      const startChatBtn = screen.getByRole('button', { name: /Start Chat/i });
      expect(startChatBtn).toBeDisabled();

      await screen.findByText(mockPersona.name);
      expect(startChatBtn).not.toBeDisabled();

      // Click to navigate
      fireEvent.click(startChatBtn);

      await waitFor(() => {
        expect(startChatBtn).toBeDisabled();
      });
    });

    test('"Back to Scenarios" button calls router.back()', async () => {
      render(<ScenarioSetup scenarioId="test-scenario-id" />);


      await screen.findByText(mockPersona.name);

      const backBtn = screen.getByText('Back to Scenarios');
      fireEvent.click(backBtn);

      expect(mockBack).toHaveBeenCalled();
    });
});
