const DEFAULT_CURRENCY = "NGN";
const DEFAULT_LOCALE = "en-US";

const COUNTRY_CURRENCY_MAP = Object.freeze({
  NG: "NGN",
  NIGERIA: "NGN",
  GH: "GHS",
  GHANA: "GHS",
  KE: "KES",
  KENYA: "KES",
  ZA: "ZAR",
  "SOUTH AFRICA": "ZAR",
  US: "USD",
  USA: "USD",
  "UNITED STATES": "USD",
  "UNITED STATES OF AMERICA": "USD",
  CA: "CAD",
  CANADA: "CAD",
  GB: "GBP",
  UK: "GBP",
  "UNITED KINGDOM": "GBP",
  ENGLAND: "GBP",
  SCOTLAND: "GBP",
  WALES: "GBP",
  DE: "EUR",
  GERMANY: "EUR",
  FR: "EUR",
  FRANCE: "EUR",
  IE: "EUR",
  IRELAND: "EUR",
  ES: "EUR",
  SPAIN: "EUR",
  IT: "EUR",
  ITALY: "EUR",
  NL: "EUR",
  NETHERLANDS: "EUR",
  BE: "EUR",
  BELGIUM: "EUR",
  PT: "EUR",
  PORTUGAL: "EUR",
  AE: "AED",
  "UNITED ARAB EMIRATES": "AED",
  UAE: "AED",
  SA: "SAR",
  "SAUDI ARABIA": "SAR",
  IN: "INR",
  INDIA: "INR",
  CN: "CNY",
  CHINA: "CNY",
  JP: "JPY",
  JAPAN: "JPY",
  AU: "AUD",
  AUSTRALIA: "AUD",
});

export function normalizeCurrencyCode(value, fallback = DEFAULT_CURRENCY) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback;
}

export function resolveWorkspaceCurrency(organization) {
  const explicitCurrency =
    organization?.default_currency ||
    organization?.currency ||
    organization?.currency_code;

  if (explicitCurrency) return normalizeCurrencyCode(explicitCurrency);

  const country = String(organization?.country || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  return COUNTRY_CURRENCY_MAP[country] || DEFAULT_CURRENCY;
}

export function getCurrencySymbol(currencyCode, locale = DEFAULT_LOCALE) {
  const currency = normalizeCurrencyCode(currencyCode);

  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);

    return parts.find((part) => part.type === "currency")?.value || currency;
  } catch {
    return currency;
  }
}

export function formatCurrency(
  value,
  currencyCode = DEFAULT_CURRENCY,
  { locale = DEFAULT_LOCALE, fallback = "—" } = {},
) {
  if (value === null || value === undefined || value === "") return fallback;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value);

  const currency = normalizeCurrencyCode(currencyCode);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency} ${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue)}`;
  }
}

export { DEFAULT_CURRENCY };
