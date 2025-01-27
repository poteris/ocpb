import { atom } from "jotai";
import {TrainingScenario} from "@/types/scenarios";
export const scenarioIdAtom = atom<string | null>(null);
export const scenarioAtom = atom<TrainingScenario | null>(null);
