export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export function getApiFieldErrors(error) {
  const detail = error?.details?.detail;

  if (!Array.isArray(detail)) return {};

  return detail.reduce((errors, item) => {
    const location = Array.isArray(item?.loc) ? item.loc : [];
    const field = [...location]
      .reverse()
      .find((value) => typeof value === "string" && value !== "body");

    if (field && typeof item?.msg === "string" && !errors[field]) {
      errors[field] = item.msg;
    }

    return errors;
  }, {});
}
