'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  content: ReactNode;
}

interface ManifoldTimelineLayoutProps {
  sections: Section[];
}

export default function ManifoldTimelineLayout({ sections }: ManifoldTimelineLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      let currentSection = sections[0]?.id || '';

      sectionRefs.current.forEach((element, id) => {
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentSection = id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current.get(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="timeline-main" style={{
      display: 'flex',
      gap: '2.5rem',
      position: 'relative',
      marginLeft: '220px',
    }}>
      <nav style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        width: '200px',
        background: 'hsla(240, 10%, 6%, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.25rem 1rem 1.25rem 1.5rem',
        zIndex: 100,
      }} className="timeline-nav">
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
          marginBottom: '1rem',
          paddingLeft: '1.5rem',
        }}>
          On this page
        </div>
        <div style={{
          position: 'relative',
          paddingLeft: '1.5rem',
        }}>
          <div style={{
            position: 'absolute',
            left: '5px',
            top: '4px',
            bottom: '4px',
            width: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
          }} />

          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isPast = sections.findIndex(s => s.id === activeSection) > index;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  background: isActive
                    ? '#00f3ff'
                    : isPast
                      ? 'rgba(0, 243, 255, 0.5)'
                      : 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 10px rgba(0, 243, 255, 0.6)' : 'none',
                }} />
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? '#00f3ff'
                    : isPast
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  lineHeight: 1.4,
                  transition: 'all 0.2s ease',
                }}>
                  {section.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ flex: 1, minWidth: 0 }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
            }}
            style={{
              marginBottom: '4rem',
              paddingBottom: '3rem',
              borderBottom: index < sections.length - 1
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : 'none',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0, 243, 255, 0.15)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                color: '#00f3ff',
                fontSize: '0.9rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {index + 1}
              </span>
              <h2 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}>
                {section.label}
              </h2>
            </div>
            {section.content}
          </section>
        ))}
      </main>

      <style jsx>{`
        @media (max-width: 1100px) {
          .timeline-nav {
            display: none !important;
          }
          .timeline-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
