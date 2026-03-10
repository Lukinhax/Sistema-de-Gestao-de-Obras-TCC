import Header from "../../components/header/header"
import Footer from "../../components/footer/footer"
import "./home.css"

export default function home() {
  return (
    <div className="home">
      <Header />
      
      <main className="main">
        <h1>Bem-vindo ao Sistema de Gestão de TCCs</h1>
        <p>Gerencie seus trabalhos de conclusão de curso de forma eficiente e organizada.</p>
      </main>
      
      <Footer />
    </div>
  )
}