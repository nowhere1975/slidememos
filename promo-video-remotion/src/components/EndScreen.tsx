import React from 'react';
import {AbsoluteFill} from 'remotion';

export const EndScreen: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 24,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Slidememos
      </div>
      <div
        style={{
          fontSize: 24,
          color: '#94a3b8',
          marginBottom: 40,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        always by your side
      </div>
      <div
        style={{
          fontSize: 20,
          color: '#cbd5e1',
          padding: '12px 24px',
          border: '2px solid #3b82f6',
          borderRadius: 8,
          fontFamily: 'monospace',
          letterSpacing: '0.5px',
        }}
      >
        chrome.google.com/webstore
      </div>
    </AbsoluteFill>
  );
};
