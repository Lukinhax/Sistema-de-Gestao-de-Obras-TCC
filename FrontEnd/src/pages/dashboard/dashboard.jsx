import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Roboto' }}>
      <h1 style={{ color: '#2e6bee', fontSize: '3rem' }}>Bem-vindo!</h1>
      <p style={{ color: '#4B5563', fontSize: '1.2rem', marginTop: '10px' }}>
        O sistema será implementado aqui em breve.
      </p>
      
      <button 
        onClick={handleLogout}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#d9534f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Sair
      </button>
    </div>
  );
}
