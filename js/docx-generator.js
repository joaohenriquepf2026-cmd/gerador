/* ============================================================
   EXPORTAÇÃO PROFISSIONAL PARA MICROSOFT WORD (.DOCX)
   Fidelidade absoluta ao PDF de referência · Margens 0.5cm · 2 Colunas com Divisória
   Folha exclusiva do Gabarito com rodapé institucional do professor
   ============================================================ */

async function canvasParaUint8Array(canvas){
  return new Promise((resolve, reject)=>{
    canvas.toBlob(blob => {
      if(!blob){ reject(new Error("Falha ao converter canvas")); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const buffer = reader.result;
        resolve(new Uint8Array(buffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    }, "image/png");
  });
}

function gerarImagemGraficoCanvas(grafico){
  if(!grafico || !grafico.dados || !grafico.dados.length) return null;
  if(typeof gerarImagemGraficoEstatisticoCanvas === "function"){
    return gerarImagemGraficoEstatisticoCanvas(grafico);
  }
  const c = document.createElement("canvas");
  c.width = 650;
  c.height = 250;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  desenharGrafico(ctx, grafico, 10, 10, c.width - 20);
  return c;
}

function gerarImagemFiguraQuestaoCanvas(figura){
  if(!figuraPossuiDadosValidos(figura)) return null;
  const c = document.createElement("canvas");
  c.width = 700;
  
  let h = 180;
  if(figura.tipo === "relogio" || figura.tipo === "rosa_dos_ventos") h = 210;
  else if(figura.tipo === "forma_geometrica") h = 190;
  else if(figura.tipo === "mini_grafico") h = 200;
  else if(figura.tipo === "baloes_dialogo") h = 170;
  else if(figura.tipo === "cadeia_alimentar" || figura.tipo === "reta_numerica") h = 140;
  
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  desenharFiguraQuestao(ctx, figura, 15, 8, c.width - 30);
  return c;
}

async function baixarDocx(){
  if(!atividade){ msg("Nenhuma atividade gerada para exportar.", true); return; }
  if(typeof docx === "undefined"){
    msg("A biblioteca do Word ainda está carregando ou indisponível. Aguarde alguns segundos.", true);
    return;
  }

  msg("Preparando documento do Word (.docx) com formatação em 2 colunas…");

  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, SectionType, ImageRun,
    Header, Footer, PageNumber, ColumnBreak
  } = docx;

  const margem1cm = 567;  // 1.0cm padrão MEC/INEP em twips
  const font11pt = 22;    // 11pt
  const fontTitlePt = 32; // 16pt

  // Cabeçalho Nativo do Word para Páginas Seguintes (2+)
  const cabecalhoWordPaginasSeguintes = new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "94A3B8" }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "94A3B8" } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 60 },
                    children: [
                      new TextRun({ text: atividade.disciplina.toUpperCase(), bold: true, size: 20, font: "Calibri", color: "0F7A6B" })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "94A3B8" } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 60 },
                    children: [
                      new TextRun({ text: atividade.turma, size: 18, font: "Calibri", color: "64748B" })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Rodapé Nativo do Word para as páginas de Prova do Aluno
  const rodapeWordPaginas = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 80 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
        children: [
          new TextRun({ text: "Página ", size: 18, font: "Calibri", color: "64748B" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", bold: true, color: "0F7A6B" }),
          new TextRun({ text: " de ", size: 18, font: "Calibri", color: "64748B" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Calibri", bold: true, color: "0F7A6B" })
        ]
      })
    ]
  });

  // Rodapé Nativo Exclusivo para a Folha do Professor (Gabarito)
  const rodapeWordGabarito = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" } },
        children: [
          new TextRun({
            text: "Documento exclusivo do professor — Guarde para o conselho de classe e planejamento pedagógico.",
            italics: true,
            size: 16,
            font: "Calibri",
            color: "64748B"
          })
        ]
      })
    ]
  });

  const secoes = [];

  // ==========================================
  // SEÇÃO 1: CABEÇALHO, INTRODUÇÃO E DADOS LADO A LADO (1 COLUNA)
  // ==========================================
  const conteudoSecao1 = [];
  conteudoSecao1.push(...criarBlocoCabecalhoWord("Folha 1", false, atividade));

  conteudoSecao1.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 120, after: 40 },
      children: [
        new TextRun({ text: atividade.titulo, bold: true, size: fontTitlePt, font: "Calibri", color: "20303A" })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "EEF7F4" },
              margins: { top: 80, bottom: 80, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Conteúdo: ", bold: true, size: font11pt, font: "Calibri", color: "0A5A4F" }),
                    new TextRun({ text: atividade.conteudo, bold: true, size: font11pt, font: "Calibri", color: "0A5A4F" })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 100 }, children: [] })
  );

  if(atividade.objetivos && atividade.objetivos.length){
    conteudoSecao1.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({ text: "OBJETIVOS DE APRENDIZAGEM", bold: true, size: 20, font: "Calibri", color: "20303A" })
        ]
      })
    );
    atividade.objetivos.forEach(obj => {
      conteudoSecao1.push(
        new Paragraph({
          bullet: { level: 0 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 30 },
          children: [new TextRun({ text: obj, size: 20, font: "Calibri", color: "3A4A52" })]
        })
      );
    });
  }

  if(atividade.textoApoio){
    conteudoSecao1.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: "LEIA, ANALISE E RESPONDA", bold: true, size: 20, font: "Calibri", color: "E4572E" })
        ]
      })
    );
    const paragrafosApoio = String(atividade.textoApoio || "").split(/\n+/).map(p => p.trim()).filter(Boolean);
    paragrafosApoio.forEach(p => {
      conteudoSecao1.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 284 }, // Recuo de 0,5cm na primeira linha (padrão MEC/ABNT)
          spacing: { after: 80, line: 260 },
          children: [
            new TextRun({ text: p, size: font11pt, font: "Calibri", color: "2C3C45" })
          ]
        })
      );
    });
  }

  // Tabela e Gráfico Lado a Lado (50%/50%)
  const temTabela = atividade.tabela && atividade.tabela.colunas && atividade.tabela.linhas;
  const temGrafico = atividade.grafico && atividade.grafico.dados && atividade.grafico.dados.length;

  if(temTabela && temGrafico){
    let celulaTabelaChildren = [];
    let celulaGraficoChildren = [];

    celulaTabelaChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 40, after: 30 },
        children: [
          new TextRun({ text: `TABELA: ${atividade.tabela.titulo}`, bold: true, size: 18, font: "Calibri", color: "0A5A4F" })
        ]
      })
    );

    const tableRows = [];
    tableRows.push(
      new TableRow({
        children: atividade.tabela.colunas.map(col => new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              margins: { left: 40, right: 40 },
              children: [new TextRun({ text: String(col), bold: true, size: 16, font: "Calibri", color: "FFFFFF" })]
            })
          ],
          shading: { fill: "0F7A6B" }
        }))
      })
    );

    atividade.tabela.linhas.forEach((linhaArr, rIdx) => {
      tableRows.push(
        new TableRow({
          children: linhaArr.map(val => new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                margins: { left: 40, right: 40 },
                children: [new TextRun({ text: String(val), size: 16, font: "Calibri" })]
              })
            ],
            shading: { fill: rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF" }
          }))
        })
      );
    });

    celulaTabelaChildren.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );

    celulaGraficoChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 30 },
        children: [
          new TextRun({ text: `GRÁFICO: ${atividade.grafico.titulo}`, bold: true, size: 18, font: "Calibri", color: "0A5A4F" })
        ]
      })
    );

    try{
      const canvasGrafico = gerarImagemGraficoCanvas(atividade.grafico);
      if(canvasGrafico){
        const imgBuffer = await canvasParaUint8Array(canvasGrafico);
        celulaGraficoChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 20 },
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: { width: 260, height: 145 }
              })
            ]
          })
        );
      }
    }catch(errGraf){
      console.warn("Falha ao embutir gráfico lado a lado:", errGraf);
    }

    conteudoSecao1.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: celulaTabelaChildren
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: celulaGraficoChildren
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 120 }, children: [] })
    );
  } else if(temTabela){
    conteudoSecao1.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: `TABELA: ${atividade.tabela.titulo}`, bold: true, size: 18, font: "Calibri", color: "0A5A4F" })
        ]
      })
    );

    const tableRows = [];
    tableRows.push(
      new TableRow({
        children: atividade.tabela.colunas.map(col => new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              margins: { left: 80 },
              children: [new TextRun({ text: String(col), bold: true, size: 20, font: "Calibri", color: "FFFFFF" })]
            })
          ],
          shading: { fill: "0F7A6B" }
        }))
      })
    );

    atividade.tabela.linhas.forEach((linhaArr, rIdx) => {
      tableRows.push(
        new TableRow({
          children: linhaArr.map(val => new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                margins: { left: 80 },
                children: [new TextRun({ text: String(val), size: 20, font: "Calibri" })]
              })
            ],
            shading: { fill: rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF" }
          }))
        })
      );
    });

    conteudoSecao1.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ spacing: { after: 100 }, children: [] })
    );
  } else if(temGrafico){
    try{
      const canvasGrafico = gerarImagemGraficoCanvas(atividade.grafico);
      if(canvasGrafico){
        const imgBuffer = await canvasParaUint8Array(canvasGrafico);
        conteudoSecao1.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 120 },
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: { width: 480, height: 170 }
              })
            ]
          })
        );
      }
    }catch(errGrafico){
      console.warn("Não foi possível gerar imagem do gráfico para o Word:", errGrafico);
    }
  }

  secoes.push({
    properties: {
      type: SectionType.CONTINUOUS,
      titlePage: true,
      page: {
        margin: { top: margem1cm, bottom: margem1cm, left: margem1cm, right: margem1cm }
      }
    },
    headers: { default: cabecalhoWordPaginasSeguintes },
    footers: { default: rodapeWordPaginas },
    children: conteudoSecao1
  });

  // ==========================================
  // SEÇÃO 2: QUESTÕES EM 2 COLUNAS COM LINHA CENTRAL
  // ==========================================
  const conteudoSecao2 = [];

  for(let i = 0; i < atividade.questoes.length; i++){
    const q = atividade.questoes[i];
    
    // Enunciado Justificado, 11pt, com PULO DE 1 LINHA
    conteudoSecao2.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: i === 0 ? 0 : 240, after: 40, line: 250 },
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, size: font11pt, font: "Calibri", color: "0F7A6B" }),
          new TextRun({ text: q.enunciado, bold: true, size: font11pt, font: "Calibri", color: "20303A" })
        ]
      })
    );

    // Validação estrita: somente gera figura se de fato possuir dados reais válidos!
    if(figuraPossuiDadosValidos(q.figura)){
      try{
        const canvasFig = gerarImagemFiguraQuestaoCanvas(q.figura);
        if(canvasFig){
          const imgFigBuffer = await canvasParaUint8Array(canvasFig);
          let figW = 240, figH = 75;
          if(q.figura.tipo === "relogio" || q.figura.tipo === "rosa_dos_ventos"){ figW = 220; figH = 88; }
          else if(q.figura.tipo === "forma_geometrica"){ figW = 230; figH = 80; }
          else if(q.figura.tipo === "mini_grafico"){ figW = 245; figH = 85; }
          else if(q.figura.tipo === "regua" || q.figura.tipo === "reta_numerica"){ figW = 250; figH = 65; }
          else if(q.figura.tipo === "termometro"){ figW = 210; figH = 80; }
          else if(q.figura.tipo === "malha_quadriculada" || q.figura.tipo === "transferidor_angulo"){ figW = 235; figH = 82; }
          else if(q.figura.tipo === "tirinha_quadrinhos" || q.figura.tipo === "chaveamento_torneio"){ figW = 255; figH = 88; }
          
          conteudoSecao2.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 60 },
              children: [
                new ImageRun({
                  data: imgFigBuffer,
                  transformation: { width: figW, height: figH }
                })
              ]
            })
          );
        }
      }catch(errFig){
        console.warn(`Erro ao gerar imagem da questão ${i+1}:`, errFig);
      }
    }

    // Alternativas (○  A)  Texto) - Alinhadas à esquerda com recuo editorial MEC/INEP (0,5 cm)
    const letras = ["A", "B", "C", "D", "E"];
    const totalAlts = q.alternativas.length;
    q.alternativas.forEach((alt, j) => {
      const letra = letras[j] || "A";
      const ehUltima = (j === totalAlts - 1);
      
      conteudoSecao2.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: ehUltima ? 40 : 0, line: 240 },
          indent: { left: 284 },
          children: [
            new TextRun({ text: "○ ", size: font11pt, font: "Calibri", color: "94A3B8" }),
            new TextRun({ text: `${letra}) `, bold: true, size: font11pt, font: "Calibri", color: "20303A" }),
            new TextRun({ text: alt, size: font11pt, font: "Calibri", color: "334155" })
          ]
        })
      );
    });
  }

  // Seção 2: 2 Colunas com auto-balanceamento natural e linha divisória fina de 0,5pt
  secoes.push({
    properties: {
      type: SectionType.CONTINUOUS,
      page: {
        margin: { top: margem1cm, bottom: margem1cm, left: margem1cm, right: margem1cm }
      },
      column: {
        count: 2,
        space: 567, // 1,0 cm de respiro
        separate: true
      }
    },
    headers: { default: cabecalhoWordPaginasSeguintes },
    footers: { default: rodapeWordPaginas },
    children: conteudoSecao2
  });

  // Seção de transição contínua para 1 coluna (Fecha o fluxo de 2 colunas equilibrando esquerda/direita)
  secoes.push({
    properties: {
      type: SectionType.CONTINUOUS,
      page: {
        margin: { top: margem1cm, bottom: margem1cm, left: margem1cm, right: margem1cm }
      },
      column: {
        count: 1
      }
    },
    headers: { default: cabecalhoWordPaginasSeguintes },
    footers: { default: rodapeWordPaginas },
    children: [new Paragraph({ children: [] })]
  });

  // ==========================================
  // SEÇÃO 3: FOLHA DO PROFESSOR · GABARITO OFICIAL (EM FOLHA SEPARADA NEXT_PAGE)
  // ==========================================
  const conteudoSecao3 = [];
  conteudoSecao3.push(...criarBlocoCabecalhoWord("Folha 4/4", true, atividade));

  // Título do Gabarito Oficial como Parágrafo Nativo Puro (Fácil de editar no Word)
  conteudoSecao3.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 140, after: 120 },
      children: [
        new TextRun({ text: "FOLHA DO PROFESSOR · GABARITO OFICIAL", bold: true, size: 24, font: "Calibri", color: "E4572E" })
      ]
    })
  );

  // Tabela Plana e Editável das 10 Questões do Gabarito (5 Colunas Nativas)
  conteudoSecao3.push(
    criarTabelaGabaritoPlanaWord(atividade.questoes),
    new Paragraph({ spacing: { after: 180 }, children: [] })
  );

  // Painel de Registro de Desempenho e Intervenção Pedagógica (BNCC)
  conteudoSecao3.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "0F7A6B" },
              margins: { top: 80, bottom: 80, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "REGISTRO DE DESEMPENHO E INTERVENÇÃO PEDAGÓGICA (BNCC)", bold: true, size: 20, font: "Calibri", color: "FFFFFF" })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "D6CFC4" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "D6CFC4" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "D6CFC4" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "D6CFC4" }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "FDFBF7" },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              children: [
                new Paragraph({
                  spacing: { after: 60 },
                  children: [
                    new TextRun({ text: `Disciplina / Conteúdo: ${atividade.disciplina} — ${atividade.conteudo}`, bold: true, size: 18, font: "Calibri" })
                  ]
                }),
                new Paragraph({
                  spacing: { after: 60 },
                  children: [
                    new TextRun({ text: `Turma: ${atividade.turma}   ·   Total de Alunos Avaliados: ______   ·   Média da Turma: ______ / 10`, size: 18, font: "Calibri" })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 80, after: 40 },
                  children: [
                    new TextRun({ text: "Habilidades e Objetivos Trabalhados:", bold: true, size: 18, font: "Calibri", color: "0A5A4F" })
                  ]
                }),
                ...(atividade.objetivos||[]).slice(0, 2).map(o => new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 30 },
                  children: [new TextRun({ text: o, size: 18, font: "Calibri", color: "334155" })]
                })),
                new Paragraph({
                  spacing: { before: 100, after: 80 },
                  children: [
                    new TextRun({ text: "Anotações para Recuperação Paralela e Retomada de Conteúdo:", bold: true, size: 18, font: "Calibri", color: "E4572E" })
                  ]
                }),
                new Paragraph({ children: [new TextRun({ text: "____________________________________________________________________________________________________", size: 18, font: "Calibri", color: "CBD5E1" })] }),
                new Paragraph({ children: [new TextRun({ text: "____________________________________________________________________________________________________", size: 18, font: "Calibri", color: "CBD5E1" })] })
              ]
            })
          ]
        })
      ]
    })
  );

  // SEÇÃO DO GABARITO COM NEXT_PAGE E RODAPÉ EXCLUSIVO DO PROFESSOR
  secoes.push({
    properties: {
      type: SectionType.NEXT_PAGE,
      titlePage: true,
      page: {
        margin: { top: margem1cm, bottom: margem1cm, left: margem1cm, right: margem1cm }
      }
    },
    headers: { default: cabecalhoWordPaginasSeguintes },
    footers: { default: rodapeWordGabarito }, // Ancorado na margem inferior como rodapé real!
    children: conteudoSecao3
  });

  try{
    const doc = new Document({ sections: secoes });
    const blob = await Packer.toBlob(doc);
    const base = (atividade.disciplina + "-" + atividade.conteudo + "-" + atividade.turma)
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = base + ".docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);

    msg("Documento Word (.docx) baixado com sucesso! Margens 0.5cm, 2 colunas e gabarito oficial fiel.");
  }catch(errDocx){
    console.error("Falha ao gerar Word (.docx):", errDocx);
    msg("Erro ao gerar o arquivo do Word: " + (errDocx.message || "Falha desconhecida"), true);
  }
}
