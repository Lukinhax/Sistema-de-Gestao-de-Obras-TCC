import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao realizar login.');
      }

      // Salvar token e redirecionar
      localStorage.setItem('token', data.token);
      localStorage.setItem('empresa', JSON.stringify(data.empresa));
      
      // Se for funcionário, salva dados dele, senão limpa e salva role empresa
      if (data.funcionario) {
        localStorage.setItem('funcionario', JSON.stringify(data.funcionario));
        localStorage.setItem('role', 'funcionario');
      } else {
        localStorage.removeItem('funcionario');
        localStorage.setItem('role', 'empresa');
      }
      
      navigate('/dashboard'); // Redireciona para o dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='login-container'>
      <Link to="/" className="auth-logo-link">
        <img src={logo} alt="Gestão de Obras Logo" className="auth-logo-img" />
      </Link>
      <div className='login-box'>
        <h1>Login</h1>
        <p>Acesse o sistema com suas credenciais de empresa.</p>
        
        <form onSubmit={handleLogin} className='login-form'>
          <div className='input-group'>
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className='input-group'>
            <label htmlFor="senha">Senha</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="senha"
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
                placeholder="Digite sua senha"
              />
              <IconButton 
                size="small"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">Entrar</button>
        </form>

        <p className="register-link">
          Ainda não possui conta? <a href="/cadastro">Cadastre-se aqui</a>
        </p>
      </div>
    </div>
  );
}
