// utils/env.ts
// Environment variable handling

/**
 * Load environment variables from .env file
 */
export async function loadEnv() {
    try {
      await import("https://deno.land/std@0.204.0/dotenv/load.ts");
    } catch (error) {
      console.error("Failed to load .env file:", error);
    }
  }
  
  /**
   * Get an environment variable
   * @param key The environment variable key
   * @param defaultValue Optional default value if the environment variable is not set
   */
  export function getEnv(key: string, defaultValue?: string): string {
    const value = Deno.env.get(key);
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  }
  
  /**
   * Get the Metlink API key from environment variables
   */
  export function getMetlinkApiKey(): string {
    return getEnv("METLINK_API_KEY", "");
  }