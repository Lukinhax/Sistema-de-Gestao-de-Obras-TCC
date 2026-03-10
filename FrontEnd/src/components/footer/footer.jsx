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
        <LinkedInIcon fontSize="large" />
        <InstagramIcon fontSize="large" />
        <FacebookIcon fontSize="large" />
        <p>Tarraf Viva, APT34 T1 - Votuporanga 15503019 - São Paulo</p>

        <div className="contact">
        <p className="contactItem"><LocalPhoneIcon fontSize="medium" sx={{ color:"white" }}/> (17) 99123-4567</p>
        <p className="contactItem"><LocalPostOfficeIcon fontSize="medium" sx={{ color: "white" }}/> lucasmamelo@hotmail.com</p>
        </div>

        <img src={logo} alt="Logo" />

      </section>
    </footer>
  )
}