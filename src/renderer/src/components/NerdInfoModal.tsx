import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Terminal,
  Cpu,
  Database,
  Globe,
  Zap,
  ShieldCheck,
  Code2,
  Sliders,
  Sparkles,
  Layers,
  Coins,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface NerdInfoModalProps {
  onClose: () => void;
}

export const NerdInfoModal: React.FC<NerdInfoModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'stack' | 'database' | 'scraper' | 'algorithm' | 'security'>('stack');
  useLockBodyScroll(true);

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ animation: 'modalOverlayFade 0.2s ease-out', zIndex: 999999 }}>
      <div
        className="modal-card glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 860,
          width: '95%',
          maxHeight: '88vh',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(34, 197, 94, 0.15)',
          animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(14, 20, 28, 0.95), rgba(8, 12, 18, 0.98))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)'
              }}
            >
              <Terminal size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  {t('infoModal.title')}
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: 'var(--accent-green)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    letterSpacing: '0.5px'
                  }}
                >
                  APP SPECS v1.0
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {t('infoModal.subtitle')}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '12px 24px',
            background: 'rgba(10, 14, 20, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            className={`pill-button ${activeTab === 'stack' ? 'active' : ''}`}
            onClick={() => setActiveTab('stack')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
          >
            <Cpu size={14} />
            {t('infoModal.tabStack')}
          </button>
          <button
            type="button"
            className={`pill-button ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
          >
            <Database size={14} />
            {t('infoModal.tabDatabase')}
          </button>
          <button
            type="button"
            className={`pill-button ${activeTab === 'scraper' ? 'active' : ''}`}
            onClick={() => setActiveTab('scraper')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
          >
            <Zap size={14} />
            {t('infoModal.tabScraper')}
          </button>
          <button
            type="button"
            className={`pill-button ${activeTab === 'algorithm' ? 'active' : ''}`}
            onClick={() => setActiveTab('algorithm')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
          >
            <TrendingUp size={14} />
            {t('infoModal.tabAlgorithm')}
          </button>
          <button
            type="button"
            className={`pill-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
          >
            <ShieldCheck size={14} />
            {t('infoModal.tabSecurity')}
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'stack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Code2 size={18} color="var(--accent-green)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Core Tech Stack & Runtime
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Electron 34+ Architecture:</strong> Multi-process container decoupling Main Process (Node.js backend logic, SQLite, HTTP scraping) from Renderer Process (React UI).</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>React 18 & TypeScript 5:</strong> Strictly typed UI components with functional hooks, custom providers (Language & Currency), and zero implicit any types.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Vite 6 Fast Bundler:</strong> Lightning-fast Hot Module Replacement (HMR) and optimized ESBuild native transpilation.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Vanilla CSS Design System:</strong> Custom tokenized HSL theme with glassmorphism backdrop filters, GPU-accelerated smooth transitions, and dynamic glows.</span>
                  </li>
                </ul>
              </div>

              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Layers size={18} color="var(--accent-cyan)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Graphics & Data Visualization
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Custom SVG path generator calculating cubic Bezier curves and linear gradient fills for zero-latency interactive price charts, average lines, hover crosshairs, and trend corridors.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Database size={18} color="var(--accent-gold)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Embedded SQLite Database Engine
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                    <span><strong>WAL (Write-Ahead Logging) Mode:</strong> High-concurrency database access enabling simultaneous reader threads and fast transactional writes without locks.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                    <span><strong>Relational Schema:</strong> Standardized <code>products</code> table indexed by Kinguin ID and <code>price_history</code> table linking timestamps with floating-point prices.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                    <span><strong>100% Offline & Private:</strong> Zero data tracking or external telemetry. All product histories and user preferences remain entirely on local disk.</span>
                  </li>
                </ul>
              </div>

              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Activity size={18} color="var(--accent-green)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Data Integrity & Transactions
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Atomic SQL transactions guarantee price snapshot creation and product metadata updates execute in unified lock steps, preventing partial state corruption upon unexpected app closure.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'scraper' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Zap size={18} color="var(--accent-cyan)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Direct Web Scraper & DOM Extraction
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>•</span>
                    <span><strong>Main-Process HTTP Pipeline:</strong> Direct GET requests bypassing browser CORS policies with customized User-Agent headers mimicking modern browsers.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>•</span>
                    <span><strong>Dual Parsing Strategy:</strong> Scrapes JSON-LD structured schema metadata first for instant accuracy; falls back to DOM CSS selectors for legacy Kinguin offer pages.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>•</span>
                    <span><strong>Automatic Currency Detection:</strong> Normalizes raw price strings (e.g., "12.49 €", "$14.99", "54.00 zł") into standardized numeric floats with ISO currency codes.</span>
                  </li>
                </ul>
              </div>

              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Sliders size={18} color="var(--accent-green)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Smart Rate Limiting & TTL Guard
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Auto-background refresh operates on a 6-hour TTL interval. Manual refresh triggers feature a strict 30-minute minimum throttle per product to protect user IP addresses from anti-scraping bans.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <TrendingUp size={18} color="var(--accent-green)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Mathematical Trend Classifier
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                  Evaluates historical price snapshots over 14-day rolling windows using ordinary least squares (OLS) linear regression to calculate drift percentages ($\Delta\%$) and volatility ranges:
                </p>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    color: 'var(--accent-green)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}
                >
                  Slope = Σ((x_i - x_avg)(y_i - y_avg)) / Σ((x_i - x_avg)²)
                  <br />
                  Drift % = (Slope * ΔTime) / Price_start
                </div>
              </div>

              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Sparkles size={18} color="var(--accent-gold)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Predictive Price Forecast Model
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Applies a dampened mean-reversion algorithm combined with historical low boundaries:
                  <br />
                  <code style={{ color: 'var(--accent-gold)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>
                    P(t) = P_mean + (P_current - P_mean) * e^(-λt) + β * t
                  </code>
                  <br />
                  Ensures projected prices remain mathematically constrained within realistic publisher discount boundaries and MSRP ceilings.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="glass-card"
                style={{ padding: 18, background: 'rgba(18, 24, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <ShieldCheck size={18} color="var(--accent-green)" />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Security & Context Isolation
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Context Isolation Enabled:</strong> Renderer process runs in a sandboxed JavaScript context with no direct access to Node.js <code>require</code> or filesystem APIs.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Preload Bridge (contextBridge):</strong> Exposes strictly typed and validated channel wrappers (<code>window.api.*</code>) for safe bidirectional IPC communication.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>•</span>
                    <span><strong>Input Validation & Sanitization:</strong> All incoming Kinguin URLs are validated against URL schemas and numerical product ID formats prior to database insertion.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: 'rgba(8, 12, 18, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <Globe size={14} color="var(--accent-cyan)" />
            <span>Kinguin Price Tracker • Native Desktop Architecture</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="pill-button active"
            style={{ padding: '6px 18px', fontSize: 12 }}
          >
            {t('deleteModal.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
