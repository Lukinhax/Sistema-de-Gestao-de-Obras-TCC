import React from 'react';
import { PASSWORD_RULES } from '../utils/passwordValidator';

/**
 * Checklist visual com os requisitos da senha, atualizado em tempo real.
 */
export default function PasswordRequirements({ senha = '' }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.8rem' }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(senha);
        return (
          <li
            key={rule.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ok ? '#10b981' : '#9ca3af',
              transition: 'color 0.2s',
              marginBottom: '2px',
            }}
          >
            <span style={{ fontWeight: 'bold', width: '12px' }}>{ok ? '✓' : '•'}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
