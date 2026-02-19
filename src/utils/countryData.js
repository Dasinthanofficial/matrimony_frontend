// src/utils/countryData.js
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const META_BY_ISO2 = {
  LK: { currency: 'LKR', currencySymbol: 'Rs', languages: ['Sinhala', 'Tamil', 'English'] },

  // kept for safety if old data exists:
  IN: { currency: 'INR', currencySymbol: '₹', languages: ['Hindi', 'English'] },
  US: { currency: 'USD', currencySymbol: '$', languages: ['English'] },
  GB: { currency: 'GBP', currencySymbol: '£', languages: ['English'] },
};

export function detectCountryFromPhone(phoneNumber) {
  if (!phoneNumber) return null;

  const parsed = parsePhoneNumberFromString(String(phoneNumber));
  if (!parsed || !parsed.country) return null;

  const iso2 = parsed.country;
  const countryCode = `+${parsed.countryCallingCode}`;

  return {
    iso2,
    countryCode,
    // ✅ FIX: avoid `{ ...undefined }` crash for unknown ISO2
    ...(META_BY_ISO2[iso2] || {}),
  };
}

export function formatPhoneNumber(countryCode, phoneNumber) {
  return `${countryCode} ${phoneNumber}`;
}

// NOTE: kept name for backward compatibility; now works for any numeric amount
export function convertCurrency(amount, iso2 = 'LK') {
  const meta = META_BY_ISO2[iso2] || META_BY_ISO2.LK;
  return {
    price: amount,
    currency: meta.currency,
    symbol: meta.currencySymbol,
    formatted: `${meta.currencySymbol}${Number(amount).toLocaleString()}`,
  };
}

export function getLanguagesForCountry(iso2 = 'LK') {
  const meta = META_BY_ISO2[iso2] || META_BY_ISO2.LK;
  return meta.languages || ['English'];
}