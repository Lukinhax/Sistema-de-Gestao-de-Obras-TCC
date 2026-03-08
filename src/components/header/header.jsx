import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
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
          <Button v ariant="text">Contato</Button>
        </div>
        <div className='divAvatar'>
          <Avatar src="/broken-image.jpg" />
        </div>
      </nav>
    </header>
  )
}