const PLACEHOLDER_WORKSPACE_NAMES = new Set([
  "string",
  "test",
  "testing",
  "organisation",
  "organization",
  "workspace",
  "company",
  "example",
  "sample",
  "demo",
  "null",
  "undefined",
  "your organisation",
  "your organization",
  "your workspace",
]);

function normalizeWorkspaceName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function isPlaceholderWorkspaceName(value) {
  return PLACEHOLDER_WORKSPACE_NAMES.has(normalizeWorkspaceName(value));
}

export function validateWorkspaceName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");

  if (!name) return "Enter a workspace name.";
  if (name.length < 2) return "Workspace name must contain at least 2 characters.";
  if (name.length > 255) return "Workspace name cannot exceed 255 characters.";
  if (!/[A-Za-z]/.test(name)) return "Workspace name must contain at least one letter.";
  if (isPlaceholderWorkspaceName(name)) {
    return "Use your real business or operations name instead of a placeholder.";
  }

  return "";
}

export function getWorkspaceDisplayName(value) {
  const name = String(value || "").trim();
  return !name || isPlaceholderWorkspaceName(name)
    ? "Workspace setup required"
    : name;
}
