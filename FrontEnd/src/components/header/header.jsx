// imports do material ui
import Button from '@mui/material/Button';

// imports do react e imagens
import logo from "../../assets/logo.svg";
import "./header.css";

export default function Header() {
  return (
    <header className="header">

        <img src={logo} alt="Logo" />

      <nav>
        <div className='divNav'>
          <Button className='btnText' variant="text">Início</Button>
          <Button className='btnText' variant="text">Serviços</Button>
          <Button className='btnText' variant="text">Sobre</Button>
          <Button className='btnText' variant="text">Contato</Button>


          <Button className='btnOutlined' variant="outlined">Login</Button>
          <Button className='btnContained' variant="contained">Cadastro</Button>
        </div>
      </nav>
    </header>
  )
}