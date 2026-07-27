import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import { IMaskInput } from 'react-imask';
import './cadastro.css';

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome_empresa: '',
    email: '',
    n_telefone: '',
    cnpj: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    let { id, value } = e.target;

    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError('Por favor, insira um e-mail válido (ex: contato@empresa.com).');
    }

    const phoneDigits = formData.n_telefone.replace(/\D/g, '');
    if (phoneDigits && phoneDigits.length < 10) {
      return setError('O número de telefone está incompleto.');
    }

    const cnpjDigits = formData.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      return setError('O CNPJ está incompleto. Verifique se digitou corretamente.');
    }

    if (formData.senha.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres.');
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao realizar o cadastro.');
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='cadastro-container'>
      <Link to="/" className="auth-logo-link">
        <img src={logo} alt="Gestão de Obras Logo" className="auth-logo-img" />
      </Link>
      <div className='cadastro-box'>
        <h1>Cadastrar Empresa</h1>
        <p>Crie uma conta para sua empresa.</p>
        
        <form onSubmit={handleRegister} className='cadastro-form'>
          <div className='input-group'>
            <label htmlFor="nome_empresa">Nome da Empresa</label>
            <input 
              type="text" 
              id="nome_empresa"
              value={formData.nome_empresa} 
              onChange={handleChange} 
              required 
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div className='input-group'>
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="Digite o e-mail"
            />
          </div>

          <div className='input-group'>
            <label htmlFor="n_telefone">Telefone</label>
            <IMaskInput 
              mask="(00) 00000-0000"
              id="n_telefone"
              value={formData.n_telefone} 
              onAccept={(value) => setFormData({...formData, n_telefone: value})}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className='input-group'>
            <label htmlFor="cnpj">CNPJ</label>
            <IMaskInput 
              mask="00.000.000/0000-00"
              id="cnpj"
              value={formData.cnpj} 
              onAccept={(value) => setFormData({...formData, cnpj: value})}
              required 
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className='input-group'>
            <label htmlFor="senha">Senha</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="senha"
                value={formData.senha} 
                onChange={handleChange} 
                required 
                placeholder="Crie uma senha"
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

          <button type="submit" className="cadastro-btn">Cadastrar</button>
        </form>

        <p className="login-link">
          Já possui conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
}
