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



export default function Home() {
  return (
    <div className="home">
      <Header />
      
      <main className="main">
        
        <section className="container-top">

          <div className="content-top">

            <div id="btnInicio">
              <h1><span>Software de Gestão para Obras</span> de Engenharia Elétrica Industrial</h1>
              <p>Gerenciamos as informações do seu projeto, com segurança e eficiência, centralizando todas as ferramentas em um só local e sem a complexidade dos sistemas tradicionais </p>
              <ul className="list-content-top">
                <li><TaskAltIcon sx={{ color: "green" }} /> Pesquisas de campo</li>
                <li><TaskAltIcon sx={{ color: "green" }} /> Testes de segurança</li>
                <li><TaskAltIcon sx={{ color: "green" }} /> Testes de qualidade do sistema</li>
                <li><TaskAltIcon sx={{ color: "green" }} /> Entrevistas com profissionais e empresas do setor</li>
              </ul>
            </div>

          </div>

          <div className="content-img">
            <img src={imgTopo} alt="Imagem Topo" />
          </div>

        </section>



        <section className="container-middle" id="serviços">

          <div className="content-middle">

            <div className="content-middle-text">
            <h1>Soluções Completas para a sua Empresa</h1>
            <p>Oferecemos uma gama de serviços para atender ás complexas necessidades de gestão de seus projetos</p>
            </div>

            <div className="Div-Grid">
              <Card className="card">  
                <CardContent>

                  <Typography variant="h1">
                    Módulo de Gestão de Custos
                  </Typography>
                  <Typography variant="body1">
                    Focado no registro e controle financeiro, permitindo o acompanhamento entre orçamentos previstos e realizados para oferecer suporte à tomada de decisão e evitar desvios orçamentários.
                  </Typography>

                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >

                  <Typography variant="h1">
                    Módulo de Gestão de Recursos
                  </Typography>
                  <Typography variant="body1">
                    Responsável pelo controle rigoroso de materiais e insumos, gerenciando o fluxo de estoque para garantir que não ocorram interrupções por falta de componentes críticos.
                  </Typography>
                  
                </CardContent>
              </Card>

              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Módulo de Gestão de Prazos
                  </Typography>
                  <Typography variant="body1">
                    Essencial para a gestão do cronograma através da definição de marcos permitindo a identificação de gargalos e garantindo a entrega pontual do projeto.
                  </Typography>
                  
                </CardContent>
              </Card>
              
              <div id="div-grid-central">
              <Card className="card">  
                <CardContent >
                  
                  <Typography variant="h1">
                    Módulo de Gestão de Mão de Obra
                  </Typography>
                  <Typography variant="body1">
                    Voltado à gestão do capital humano e alocação de equipes, organizando a distribuição de tarefas e o controle de horas para otimizar a produtividade no canteiro de obras.
                  </Typography>
                  
                </CardContent>
              </Card>
              </div>
            </div>

          </div>

        </section>



        <section id="content-bottom" id="sobre">
          <div className="container-bottom">
            <div id="content-bottom-Left">
              <h2>Sobre o Sistema</h2>
              <p>Sistema web voltado à gestão de projetos de engenharia elétrica industrial, com o objetivo de centralizar e organizar informações relacionadas a custos, prazos, mão de obra e recursos. A implementação desse sistema incluem maior confiabilidade no acompanhamento de projetos, melhor controle dos recursos disponíveis e redução de atrasos e falhas de comunicação entre os setores envolvidos.</p>
            </div>

            <div id="content-bottom-Right">
              <img src={imgTopo} alt="Imagem Topo" />
            </div>  
          </div>
        </section>   

      </main>
      
      <Footer />
    </div>
  )
}