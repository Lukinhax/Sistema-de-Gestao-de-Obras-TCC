const PDFDocument = require('pdfkit');

exports.gerarRelatorioPDF = async (req, res) => {
  try {
    // A rota vai receber as imagens em base64 do frontend
    const { nomeProjeto, ganttImage, curvaSImage } = req.body;

    // Criar um documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar o response headers para forçar download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ORC_Relatorio_${nomeProjeto || 'Projeto'}.pdf`);

    // Pipe the PDF para a resposta HTTP diretamente
    doc.pipe(res);

    // Cabeçalho do Relatório
    doc.fontSize(20).text('Relatório Oficial de Cronograma e Avanço', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Obra/Projeto: ${nomeProjeto || 'N/A'}`, { align: 'center' });
    doc.moveDown(2);

    // Texto descritivo Curva S
    doc.fontSize(12).text('1. Avanço Físico-Financeiro (Curva S)', { underline: true });
    doc.moveDown(0.5);
    
    if (curvaSImage) {
      // Remover cabeçalho data:image/png;base64,
      const base64Data = curvaSImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      // Adicionar a imagem da Curva S no PDF (centralizada)
      doc.image(buffer, {
        fit: [500, 300],
        align: 'center',
        valign: 'center'
      });
    } else {
      doc.fontSize(10).text('Gráfico da Curva S não disponibilizado.', { color: 'gray' });
    }

    doc.addPage();

    // Texto descritivo Gantt
    doc.fontSize(12).text('2. Estrutura Analítica do Projeto e Gráfico de Gantt', { underline: true, color: 'black' });
    doc.moveDown(0.5);

    if (ganttImage) {
      const base64Data = ganttImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      // O Gantt costuma ser mais largo, vamos usar fit adequado
      doc.image(buffer, {
        fit: [500, 700], // Ajusta na página A4 vertical
        align: 'center',
        valign: 'top'
      });
    } else {
      doc.fontSize(10).text('Gráfico de Gantt não disponibilizado.', { color: 'gray' });
    }

    // Finaliza o documento PDF
    doc.end();

  } catch (error) {
    console.error('Erro ao gerar PDF do relatório:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erro ao gerar o relatório em PDF.' });
    }
  }
};
