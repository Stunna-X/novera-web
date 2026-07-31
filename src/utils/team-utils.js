export const WORKFORCE_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On leave" },
  { value: "suspended", label: "Suspended" },
];

export const EMPLOYMENT_TYPES = [
  { value: "", label: "Not specified" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contractor", label: "Contractor" },
  { value: "casual", label: "Casual" },
  { value: "intern", label: "Intern" },
];

export function teamMemberName(member) {
  const name = [member?.first_name, member?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || member?.email || "Team member";
}

export function membershipName(membership) {
  const user = membership?.user;
  const name = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || user?.email || "Organization member";
}

export function humanizeTeamValue(value, fallback = "Not specified") {
  if (!value) return fallback;
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function skillsToText(skills) {
  return Array.isArray(skills) ? skills.join(", ") : "";
}

export function parseSkills(value) {
  const unique = new Set(
    String(value || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
  );

  return [...unique].slice(0, 100);
}

function optionalText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function buildWorkforcePayload(values, { includeMembership = false } = {}) {
  const payload = {
    employee_code: optionalText(values.employeeCode),
    job_title: optionalText(values.jobTitle),
    employment_type: values.employmentType || null,
    phone: optionalText(values.phone),
    emergency_contact_name: optionalText(values.emergencyContactName),
    emergency_contact_phone: optionalText(values.emergencyContactPhone),
    skills: parseSkills(values.skillsText),
    joined_on: values.joinedOn || null,
    status: values.status || "active",
    is_available: Boolean(values.isAvailable),
    notes: optionalText(values.notes),
  };

  if (includeMembership) {
    payload.membership_id = values.membershipId;
  }

  return payload;
}

export function profileToFormValues(profile) {
  return {
    employeeCode: profile?.employee_code || "",
    jobTitle: profile?.job_title || "",
    employmentType: profile?.employment_type || "",
    phone: profile?.phone || "",
    emergencyContactName: profile?.emergency_contact_name || "",
    emergencyContactPhone: profile?.emergency_contact_phone || "",
    skillsText: skillsToText(profile?.skills),
    joinedOn: profile?.joined_on || "",
    status: profile?.status || "active",
    isAvailable: Boolean(profile?.is_available),
    notes: profile?.notes || "",
  };
}
