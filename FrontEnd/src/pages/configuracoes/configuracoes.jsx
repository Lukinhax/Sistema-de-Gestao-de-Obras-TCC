import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Configuracoes() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px', fontFamily: 'Roboto, sans-serif' }}>
      <h1>Configurações do Sistema</h1>
      <p style={{ marginTop: '20px', color: '#6b7280' }}>
        Esta página está em construção. Em breve, as opções de configuração estarão disponíveis aqui.
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#2e6bee',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Voltar para o Dashboard
      </button>
    </div>
  );
}
