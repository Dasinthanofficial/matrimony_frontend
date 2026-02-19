// src/components/CountryCodeSelect.jsx
import React, { useMemo, useState } from 'react';
import { PHONE_COUNTRIES } from '../utils/phoneCountries';

export default function CountryCodeSelect({ valueIso2, onChangeIso2 }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((c) => {
      return (
        c.name.toLowerCase().includes(query) ||
        c.iso2.toLowerCase().includes(query) ||
        c.callingCode.includes(query)
      );
    });
  }, [q]);

  return (
    <div className="space-y-2">
      <input
        className="input w-full"
        placeholder="Search country / code (e.g. Sri Lanka, +94)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <select
        className="select w-full"
        value={valueIso2 || 'LK'}
        onChange={(e) => onChangeIso2?.(e.target.value)}
      >
        {filtered.map((c) => (
          <option key={c.iso2} value={c.iso2}>
            {c.flag} {c.name} ({c.callingCode})
          </option>
        ))}
      </select>
    </div>
  );
}