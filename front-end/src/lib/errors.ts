/**
 * Extract a user-friendly error message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";

  const msg =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : String(error);

  // User rejected the transaction in wallet
  if (msg.includes("User rejected") || msg.includes("user rejected")) {
    return "Transaction rejected";
  }

  // Contract revert — try to extract reason
  const revertMatch = msg.match(/reverted with reason string '([^']+)'/);
  if (revertMatch) return revertMatch[1];

  const customErrorMatch = msg.match(/reverted with custom error '([^'(]+)/);
  if (customErrorMatch) return customErrorMatch[1];

  // Fallback: first line only
  return msg.split("\n")[0] || "Transaction failed";
}
