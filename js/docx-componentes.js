/* ============================================================
   COMPONENTES VISUAIS MODULARES DO MICROSOFT WORD (.DOCX)
   Desacoplamento de cabeçalhos, cartões do gabarito oficial e tabelas BNCC
   ============================================================ */

/**
 * Cria o bloco de cabeçalho do Word (verde petróleo, nome do aluno e metadados)
 */
function criarBlocoCabecalhoWord(folhaTexto, ehGabarito = false, atividade){
  const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = docx;
  const elementos = [];
  const totalFolhasStr = folhaTexto || (ehGabarito ? "Folha 4/4" : "Folha 1");

  elementos.push(
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
              margins: { top: 140, bottom: 140, left: 200, right: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 40 },
                  children: [
                    new TextRun({ text: atividade.disciplina.toUpperCase(), bold: true, size: 36, font: "Calibri", color: "FFFFFF" }),
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
                          width: { size: 70, type: WidthType.PERCENTAGE },
                          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.LEFT,
                              children: [
                                new TextRun({ text: atividade.turma, bold: true, size: 22, font: "Calibri", color: "D8F2EC" })
                              ]
                            })
                          ]
                        }),
                        new TableCell({
                          width: { size: 30, type: WidthType.PERCENTAGE },
                          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({ text: totalFolhasStr, bold: true, size: 20, font: "Calibri", color: "FFFFFF" })
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  );

  if(!ehGabarito){
    elementos.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 140, after: 120 },
        children: [
          new TextRun({ text: "Nome: _________________________________________________________________   Data: ____/____/________", size: 20, font: "Calibri", color: "3A4A52" })
        ]
      })
    );
  }

  return elementos;
}

/**
 * Cria a Tabela Plana e Editável do Gabarito Oficial (5 Colunas Nativas)
 * Estrutura: [ Questão Impar ] [ Letra ] [ Espaço ] [ Questão Par ] [ Letra ]
 * Arquitetura limpa: zero tabelas aninhadas, fácil para qualquer humano editar no Word
 */
function criarTabelaGabaritoPlanaWord(questoes){
  const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = docx;
  const tableRows = [];

  const bordaPadrao = { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" };
  const bordaNula = { style: BorderStyle.NONE };

  function extrairLetra(q){
    if(!q) return "-";
    if(typeof q.correta === "number") return ["A","B","C","D","E"][q.correta] || "A";
    if(typeof q.correta === "string" && q.correta.trim()) return q.correta.trim().toUpperCase().charAt(0);
    return "A";
  }

  for(let r = 0; r < 5; r++){
    const qEsq = questoes[r * 2];
    const qDir = questoes[r * 2 + 1];
    const numEsq = r * 2 + 1;
    const numDir = r * 2 + 2;

    const letraEsq = extrairLetra(qEsq);
    const letraDir = extrairLetra(qDir);

    // Linha de dados com as 5 colunas
    tableRows.push(
      new TableRow({
        children: [
          // 1. Questão Ímpar
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: { top: bordaPadrao, bottom: bordaPadrao, left: bordaPadrao, right: bordaNula },
            shading: { fill: "F8FAFC" },
            margins: { top: 80, bottom: 80, left: 140, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: `Questão ${numEsq}`, bold: true, size: 22, font: "Calibri", color: "1E293B" })
                ]
              })
            ]
          }),
          // 2. Letra Ímpar (Verde Petróleo Institucional com Letra Branca)
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: { top: bordaPadrao, bottom: bordaPadrao, left: bordaNula, right: bordaPadrao },
            shading: { fill: "0F7A6B" },
            margins: { top: 80, bottom: 80, left: 40, right: 40 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: letraEsq, bold: true, size: 24, font: "Calibri", color: "FFFFFF" })
                ]
              })
            ]
          }),
          // 3. Coluna Central de Separação (Espaçador Neutro)
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula },
            children: [new Paragraph({ children: [] })]
          }),
          // 4. Questão Par
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: { top: bordaPadrao, bottom: bordaPadrao, left: bordaPadrao, right: bordaNula },
            shading: { fill: "F8FAFC" },
            margins: { top: 80, bottom: 80, left: 140, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: `Questão ${numDir}`, bold: true, size: 22, font: "Calibri", color: "1E293B" })
                ]
              })
            ]
          }),
          // 5. Letra Par (Verde Petróleo Institucional com Letra Branca)
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: { top: bordaPadrao, bottom: bordaPadrao, left: bordaNula, right: bordaPadrao },
            shading: { fill: "0F7A6B" },
            margins: { top: 80, bottom: 80, left: 40, right: 40 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: letraDir, bold: true, size: 24, font: "Calibri", color: "FFFFFF" })
                ]
              })
            ]
          })
        ]
      })
    );

    // Linha de respiro entre cada questão (exceto após a última)
    if(r < 4){
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula }, children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [] })] }),
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula }, children: [new Paragraph({ children: [] })] }),
            new TableCell({ width: { size: 4, type: WidthType.PERCENTAGE }, borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula }, children: [new Paragraph({ children: [] })] }),
            new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula }, children: [new Paragraph({ children: [] })] }),
            new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: { top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula }, children: [new Paragraph({ children: [] })] })
          ]
        })
      );
    }
  }

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: bordaNula, bottom: bordaNula, left: bordaNula, right: bordaNula,
      insideHorizontal: bordaNula, insideVertical: bordaNula
    }
  });
}
