const ISSUE_PATTERN = /\[\[NOVERA_ASSET_ISSUE:([^\]]+)\]\]/g;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function createIssueMarker(issue) {
  return `[[NOVERA_ASSET_ISSUE:${encodeURIComponent(JSON.stringify(issue))}]]`;
}

export function isAssetIssueResolved(issue) {
  return Boolean(issue?.resolved_at);
}

export function getAssetIssueJobLabel(issue) {
  const title = normalizeText(issue?.related_job_title);
  const number = normalizeText(issue?.related_job_number);

  if (title && number) return `${title} · ${number}`;
  if (title) return title;
  if (number) return number;

  return normalizeText(issue?.related_job) || "";
}

export function splitAssetNotes(value) {
  const issues = [];
  const source = String(value ?? "");

  const notes = source
    .replace(ISSUE_PATTERN, (match, encodedIssue) => {
      try {
        const issue = JSON.parse(decodeURIComponent(encodedIssue));

        if (issue && typeof issue === "object") {
          issues.push(issue);
          return "";
        }
      } catch {
        return match;
      }

      return match;
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  issues.sort((first, second) => {
    const firstTime = new Date(first.reported_at || 0).getTime();
    const secondTime = new Date(second.reported_at || 0).getTime();
    return secondTime - firstTime;
  });

  return { notes, issues };
}

export function combineAssetNotes(notes, issues = []) {
  const visibleNotes = normalizeText(notes);
  const issueMarkers = issues
    .filter(Boolean)
    .map(createIssueMarker)
    .join("\n");

  return [visibleNotes, issueMarkers].filter(Boolean).join("\n\n") || null;
}

export function appendAssetIssue(notesValue, issue) {
  const current = splitAssetNotes(notesValue);
  return combineAssetNotes(current.notes, [issue, ...current.issues]);
}

export function resolveAssetIssue(notesValue, issueId, resolution) {
  const current = splitAssetNotes(notesValue);
  let found = false;

  const issues = current.issues.map((issue) => {
    if (issue?.id !== issueId) return issue;

    found = true;

    return {
      ...issue,
      resolved_at: resolution.resolved_at,
      resolution_note: resolution.resolution_note,
      resolution_status: resolution.resolution_status,
      resolution_condition: resolution.resolution_condition,
      resolution_service_date: resolution.resolution_service_date,
    };
  });

  if (!found) {
    throw new Error("The selected equipment issue could not be found.");
  }

  return combineAssetNotes(current.notes, issues);
}
