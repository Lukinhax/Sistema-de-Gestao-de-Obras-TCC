//Import de img e estilização
import "./footer.css";
import logo from "../../assets/logo.svg";

export default function Footer() {
  return (
    <footer className="footer">
        <p>Trabalho de conclusão de curso - Sistema de gestão de obras</p>
        <img src={logo} alt="Logo" />
    </footer>
  )
}