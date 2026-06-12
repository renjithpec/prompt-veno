/**
 * Error sanitization utility for server actions.
 * Catches errors, logs full details server-side, and returns
 * safe generic messages to the client. Never leaks stack traces
 * or database structure.
 */

import { ZodError } from "zod";

/**
 * Map of known safe error messages that can be shown to users.
 * Any error message not in this list gets replaced with a generic message.
 */
const SAFE_ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /duplicate key/i, message: "This item already exists." },
  { pattern: /violates foreign key/i, message: "This item is referenced by other data and cannot be modified." },
  { pattern: /violates check constraint/i, message: "The provided data is invalid." },
  { pattern: /Unauthorized/i, message: "Unauthorized" },
  { pattern: /Cannot follow yourself/i, message: "Cannot follow yourself" }
];

/**
 * Sanitize an error for client display.
 * Logs full error server-side, returns a safe message.
 */
export function sanitizeError(error: unknown, context: string): string {
  // Log full error details server-side only
  console.error(`[${context}]`, error);

  // Zod validation errors — show field-level feedback
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => {
      const field = issue.path.join(".");
      return field ? `${field}: ${issue.message}` : issue.message;
    });
    return issues.join(". ");
  }

  // Known safe error patterns
  if (error instanceof Error) {
    for (const { pattern, message } of SAFE_ERROR_PATTERNS) {
      if (pattern.test(error.message)) return message;
    }
  }

  // Generic fallback — never expose raw error
  return "Something went wrong. Please try again.";
}

/**
 * Wraps a server action function with error sanitization.
 * On error, redirects to the given errorPath with a safe error message.
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<void>>(
  action: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      await action(...args);
    } catch (error: unknown) {
      // Re-throw redirect errors (Next.js uses thrown redirects)
      if (isRedirectError(error)) throw error;
      // Log and throw a sanitized error
      const safeMessage = sanitizeError(error, context);
      throw new Error(safeMessage);
    }
  }) as T;
}

/**
 * Check if an error is a Next.js redirect (which uses throw internally).
 * These must be re-thrown, not caught.
 */
export function isRedirectError(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = (error as { digest: string }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}
