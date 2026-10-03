import { createContext, useContext } from "react";

export const LearningStorageContext = createContext(null);

export function useLearningStorage() {
  return useContext(LearningStorageContext) || window.localStorage;
}
