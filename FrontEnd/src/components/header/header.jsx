// imports do material ui
import Button from '@mui/material/Button';

// imports do radix ui

// imports do react e imagens
import logo from "../../assets/logo.svg";
import "./header.css";

export default function Header() {
  return (
    <header className="header">

        <img src={logo} alt="Logo" />

      <nav>
        <div className='divNav'>
          <Button variant="text">Início</Button>
          <Button variant="text">Serviços</Button>
          <Button variant="text">Sobre</Button>
          <Button variant="text">Contato</Button>
          <Button variant="outlined">Login</Button>
          <Button variant="contained">Cadastro</Button>
        </div>
      </nav>
    </header>
  )
}