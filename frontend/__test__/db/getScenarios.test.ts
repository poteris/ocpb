import { getScenarios } from "@/lib/server/services/scenarios/getScenarios";
import { TrainingScenario } from "@/types/scenarios";
import "@testing-library/jest-dom";
import { supabase } from "../../app/api/init";

jest.mock("../../app/api/init");

describe("getScenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call Supabase with the correct table and select fields", async () => {
    // We mock the return value from supabase
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    await getScenarios();

    expect(supabase.from).toHaveBeenCalledWith("scenarios");

    // using regex to match the fields in any order and ignoring whitespace
    const expectedQueryString = /id,\s*title,\s*description,\s*context,\s*scenario_objectives \(objective\)/;

    expect(supabase.from("scenarios").select).toHaveBeenCalledWith(expect.stringMatching(expectedQueryString));
  });

  it("should return an empty array when there is an error", async () => {
    const mockError = {
      message: "Error message",
      details: "Error details",
      hint: "Error hint",
      code: "Error code",
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    console.error = jest.fn();

    const result = await getScenarios();

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching scenarios:",
      expect.objectContaining({
        message: mockError.message,
        details: mockError.details,
        hint: mockError.hint,
        code: mockError.code,
      })
    );
    expect(result).toEqual([]);
  });

  it("should return formatted scenario data when no error", async () => {
    // NOTE: we transform the data in the original function to add the objectives for each scenario
    const mockData = [
      {
        id: "1",
        title: "Scenario A",
        description: "Description A",
        context: "Context A",
        scenario_objectives: [{ objective: "Objective A1" }, { objective: "Objective A2" }],
      },
      {
        id: "2",

        title: "Scenario B",
        description: "Description B",
        context: "Context B",
        scenario_objectives: [{ objective: "Objective B1" }],
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await getScenarios();

    const expected: TrainingScenario[] = [
      {
        id: "1",
        title: "Scenario A",
        description: "Description A",
        context: "Context A",
        objectives: ["Objective A1", "Objective A2"],
      },
      {
        id: "2",
        title: "Scenario B",
        description: "Description B",
        context: "Context B",
        objectives: ["Objective B1"],
      },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle missing scenario_objectives and return an empty objectives array", async () => {
    const mockData = [
      {
        id: "1",
        title: "Scenario C",
        description: "Description C",
        context: "Context C",
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await getScenarios();

    expect(result).toEqual([
      {
        id: "1",
        title: "Scenario C",
        description: "Description C",
        context: "Context C",
        objectives: [],
      },
    ]);
  });
});
