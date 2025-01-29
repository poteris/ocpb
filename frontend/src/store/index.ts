import { atom } from "jotai";
import {TrainingScenario} from "@/types/scenarios";
import {Persona} from "@/types/persona";
export const scenarioIdAtom = atom<string | null>(null);
export const scenarioAtom = atom<TrainingScenario | null>(null);
export const selectedPersonaAtom = atom<Persona | null>(null);