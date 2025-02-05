export type Result<T = void> = 
  | { success: true; data?: T | null } 
  | { success: false; error: string };
 