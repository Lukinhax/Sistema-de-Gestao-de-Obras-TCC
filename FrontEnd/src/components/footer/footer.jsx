import "./footer.css";
import logo from "../../assets/logo.svg";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';


export default function Footer() {
  return (
    <footer className="footer">
      <section className="footer-section">

        <nav className="social">
          <ul>
            <li><a href="#"><LinkedInIcon fontSize="large" sx={{ color:"white" }} /></a></li>
            <li><a href="#"><InstagramIcon fontSize="large" sx={{ color:"white" }} /></a></li>
            <li><a href="#"><FacebookIcon fontSize="large" sx={{ color:"white" }} /></a></li>
          </ul>
        </nav>

        <p id="endereco">Tarraf Viva, APTO 34 T1 - Votuporanga 15503019 - São Paulo</p>

        <div className="contact">
          <p className="contactItem"><LocalPhoneIcon fontSize="medium" sx={{ color:"white" }}/> (21) 98033-2268</p>
          <p className="contactItem"><LocalPostOfficeIcon fontSize="medium" sx={{ color: "white" }}/> lucasmamelo@hotmail.com</p>
        </div>

        <img src={logo} alt="Logo" />

      </section>
    </footer>
  )
}