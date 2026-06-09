'use client';

import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  shortLabel: string;
  content: ReactNode;
}

interface VAETabLayoutProps {
  tabs: Tab[];
  deepDives: { id: string; title: string; content: ReactNode }[];
}

export default function VAETabLayout({ tabs, deepDives }: VAETabLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const [expandedDive, setExpandedDive] = useState<string | null>(null);

  return (
    <div>
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'hsl(240, 10%, 4%)',
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent',
        }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '0 0 auto',
                padding: '0.75rem 1.25rem',
                background: activeTab === tab.id
                  ? 'rgba(0, 243, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tab.id
                  ? '1px solid rgba(0, 243, 255, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: activeTab === tab.id ? '#00f3ff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: activeTab === tab.id
                  ? 'rgba(0, 243, 255, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {index + 1}
              </span>
              <span className="tab-full-label" style={{ display: 'none' }}>{tab.label}</span>
              <span className="tab-short-label">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

      </div>

      <div style={{
        minHeight: '400px',
        animation: 'fadeIn 0.3s ease',
      }}>
        {tabs.find(t => t.id === activeTab)?.content}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1].id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={tabs.findIndex(t => t.id === activeTab) === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: tabs.findIndex(t => t.id === activeTab) === 0
              ? 'var(--text-dim)'
              : 'var(--text-secondary)',
            cursor: tabs.findIndex(t => t.id === activeTab) === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            opacity: tabs.findIndex(t => t.id === activeTab) === 0 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1].id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1}
          style={{
            padding: '0.75rem 1.5rem',
            background: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 243, 255, 0.15)',
            border: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1
              ? '1px solid rgba(255, 255, 255, 0.15)'
              : '1px solid rgba(0, 243, 255, 0.4)',
            borderRadius: '10px',
            color: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1
              ? 'var(--text-dim)'
              : '#00f3ff',
            cursor: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            opacity: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>

      {deepDives.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🔬</span>
            Deep Dives
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            fontSize: '1rem',
          }}>
            Optional explorations for those who want to go deeper.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deepDives.map((dive) => (
              <div
                key={dive.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedDive(expandedDive === dive.id ? null : dive.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <span>{dive.title}</span>
                  <span style={{
                    transform: expandedDive === dive.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                  }}>
                    ▼
                  </span>
                </button>

                {expandedDive === dive.id && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    {dive.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

<style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 900px) {
          .tab-full-label {
            display: inline !important;
          }
          .tab-short-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
