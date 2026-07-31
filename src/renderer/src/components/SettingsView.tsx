import React from 'react';
import { ShieldCheck, HardDrive, Clock, Database, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Ustawienia i stan systemu</h2>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-green-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Tryb Fazy 1 — Lokalna baza danych (SQLite)</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Aplikacja działa w trybie rodzimym bez zewnętrznego backendu. Wszystkie dane są przechowywane lokalnie na urządzeniu.
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-cyan-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Częstotliwość sprawdzania cen (TTL)</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Domyślny interwał odświeżania cen wynosi <strong>6 godzin</strong> (z ograniczeniem minimalnego odstępu do 30 minut per produkt).
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'var(--accent-gold-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}
          >
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Abstrakcja Repozytorium (PriceRepository)</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Zgodnie ze specyfikacją architektury, kod przygotowany jest pod bezproblemowe podłączenie zsynchronizowanego backendu Node.js + Postgres (Faza 2).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
