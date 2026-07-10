// imports do material ui
import Button from '@mui/material/Button';

// imports do react e imagens
import logo from "../../assets/logo.svg";
import "./header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">

        <img src={logo} alt="Logo" />

      <nav>
        <div className='divNav'>
          <Button className='btnText' variant="text" href="/#serviços">Serviços</Button>
          <Button className='btnText' variant="text" href="/#sobre">Sobre</Button>

          <Button className='btnOutlined' variant="outlined" component={Link} to="/login">
            Login
          </Button>

          <Button className='btnContained' variant="contained" component={Link} to="/cadastro">
            Cadastro
          </Button>
        </div>
      </nav>
    </header>
  )
}