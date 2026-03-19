/*Import de componentes e estilização*/
import Header from "../../components/header/header"
import Footer from "../../components/footer/footer"
import "./home.css"

/*Import de img e Import de icone do material UI*/
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import imgTopo from "../../assets/imgTopo.jpg"

/*Import card do material*/
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from "@mui/material/Typography";



export default function home() {
  return (
    <div className="home">
      <Header />
      
      <main className="main">
        
        <section className="container-top">

          <div className="content-top">

            <div className="rodape-title">
              <h2>Excelencia em Gestão de Projetos Elétrico Industriais</h2>
            </div>

            <div>
              <h1>Soluções para <span>Gestão</span> de Projetos Elétrico Industriais</h1>
              <p>Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas</p>
              <ul className="list-content-top">
                <li><TaskAltIcon sx={{ color: "green" }} /> Mais de 15 anos no mercado</li>
                <li><TaskAltIcon sx={{ color: "green" }} /> Equipe especializada e certificada</li>
                <li><TaskAltIcon sx={{ color: "green" }} /> Projetos personalizados para a sua industria</li>
              </ul>
            </div>

          </div>

          <div className="content-img">
            <img src={imgTopo} alt="Imagem Topo" />
          </div>

        </section>



        <section className="container-middle">

          <div className="content-middle">
            
            <div className="content-middle-title"> 
              <h2>Nossos serviços</h2>
            </div>

            <div className="content-middle-text">
            <h1>Soluções Completas em Engenharia Elétrica</h1>
            <p>Oferecemos uma gama completa de serviços para atender todas as necessidades elétricas da sua indústria</p>
            </div>

            <div className="Div-Grid">
              <Card className="card">  
                <CardContent>

                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>

                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >

                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>
                  
                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>
                  
                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>
                  
                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>
                  
                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Projetos Elétricos Industriais
                  </Typography>
                  <Typography variant="body1">
                    Gerenciamos projetos elétricos industriais completos, desde o planejamento até a execução, garantindo eficiência, segurança e conformidade com as normas técnicas.
                  </Typography>
                  
                </CardContent>
              </Card>
            </div>

          </div>

        </section>

      </main>
      
      <Footer />
    </div>
  )
}