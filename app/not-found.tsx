'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0f1d',
      color: '#cbd5e1',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', fontStyle: 'italic' }}>
        Neural Link Broken
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', fontWeight: 'bold' }}>
        404 - SECTOR NOT FOUND
      </p>
      <Link 
        href="/" 
        style={{
          padding: '0.75rem 2rem',
          backgroundColor: '#10b981',
          color: '#0f172a',
          borderRadius: '0.75rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          textDecoration: 'none',
          boxShadow: '0 0 20px rgba(16,185,129,0.3)'
        }}
      >
        RECONNECT TO HOME
      </Link>
    </div>
  );
}
