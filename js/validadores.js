/* ============================================================
   VALIDADOR ESTRITO DE INTEGRIDADE PEDAGÓGICA (ANTI-FANTASMAS)
   Garante que nenhuma matéria gere figuras invisíveis ou caixas em branco.
   Se os dados reais não estiverem completos, a figura é sumariamente descartada.
   ============================================================ */

function figuraPossuiDadosValidos(fig){
  if(!fig || typeof fig !== "object") return false;
  const tipo = fig.tipo;
  if(!tipo || tipo === "nenhuma") return false;

  switch(tipo){
    case "mini_grafico":
      return Array.isArray(fig.rotulos) && fig.rotulos.length >= 2 &&
             Array.isArray(fig.valores) && fig.valores.length >= 2 &&
             fig.valores.some(v => Number(v) > 0);

    case "reta_numerica":
      return fig.inicio !== undefined && fig.fim !== undefined && Number(fig.fim) > Number(fig.inicio);

    case "forma_geometrica":
      return Boolean(fig.forma) && typeof fig.forma === "string";

    case "relogio":
      return fig.horas !== undefined && !isNaN(Number(fig.horas));

    case "fracao_visual":
      return fig.numerador !== undefined && fig.denominador !== undefined && Number(fig.denominador) > 0;

    case "balanca_medicao":
      return Boolean(fig.pratoEsquerdo && fig.pratoDireito);

    case "baloes_dialogo":
      return Boolean(fig.fala1 && fig.fala2);

    case "verbete_dicionario":
      return Boolean(fig.palavra) && Array.isArray(fig.definicoes) && fig.definicoes.length > 0;

    case "linha_do_tempo":
      return Array.isArray(fig.marcos) && fig.marcos.length >= 2 && fig.marcos.every(m => m.ano && m.evento);

    case "ficha_fonte":
      return Boolean(fig.trechoFonte || (fig.tipoFonte && fig.autorFonte));

    case "rosa_dos_ventos":
      return true; // Desenho geométrico completo e autocontido

    case "cadeia_alimentar":
      return Array.isArray(fig.etapas) && fig.etapas.length >= 2;

    case "ciclo_esquema":
      return Array.isArray(fig.etapas) && fig.etapas.length >= 2;

    case "circulo_cromatico":
      return true; // Diagrama cromático completo e autocontido

    case "quadro_reflexivo":
      return Boolean(fig.colunaA && fig.textoA);

    case "termometro":
      return fig.temperatura !== undefined && !isNaN(Number(fig.temperatura));

    case "malha_quadriculada":
      return true; // Grade e figura autocontidas

    case "transferidor_angulo":
      return fig.angulo !== undefined && !isNaN(Number(fig.angulo));

    case "tirinha_quadrinhos":
      return Boolean(fig.fala1 || (Array.isArray(fig.quadros) && fig.quadros.length >= 1));

    case "chaveamento_torneio":
      return true; // Diagrama esportivo completo e autocontido

    default:
      return false;
  }
}

/* ============================================================
   VALIDADOR E SANITIZADOR DE ENUNCIADOS (BLINDAGEM ANTI-FANTASMAS)
   Impede que questões façam menção a imagens ou gráficos que não existem.
   ============================================================ */
function sanitizarEValidarQuestao(q, temTabelaIntro, temGraficoIntro){
  if(!q || typeof q !== "object") return { valida: false, motivo: "Objeto de questão nulo" };

  let en = String(q.enunciado || "").trim();
  if(!en) return { valida: false, motivo: "Enunciado vazio" };

  const temFigura = figuraPossuiDadosValidos(q.figura);
  const figuraValida = temFigura ? q.figura : null;

  // Sanitização inteligente: se a questão se refere à tabela ou gráfico da introdução usando "abaixo" ou "mini gráfico", corrigimos a redação
  if(temTabelaIntro){
    en = en.replace(/\b(?:na|da)\s+(?:tabela|mini[\s\-]tabela)\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "na tabela de apoio")
           .replace(/\b(?:a|pela)\s+(?:tabela|mini[\s\-]tabela)\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "a tabela de apoio")
           .replace(/\b(?:observando|analisando|consultando)\s+a\s+tabela\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "observando a tabela de apoio");
  }
  if(temGraficoIntro){
    en = en.replace(/\b(?:no|do)\s+(?:gr[áa]fico|mini[\s\-]gr[áa]fico)\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "no gráfico principal")
           .replace(/\b(?:ao|pelo)\s+(?:gr[áa]fico|mini[\s\-]gr[áa]fico)\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "ao gráfico principal")
           .replace(/\b(?:observando|analisando|consultando)\s+o\s+(?:gr[áa]fico|mini[\s\-]gr[áa]fico)\s+(?:abaixo|a\s+seguir|ao\s+lado)\b/gi, "observando o gráfico principal")
           .replace(/\b(?:de\s+acordo\s+com\s+o|com\s+base\s+no)\s+mini[\s\-]gr[áa]fico(?:\s+abaixo)?\b/gi, "de acordo com o gráfico principal")
           .replace(/\banalise\s+o\s+mini[\s\-]gr[áa]fico(?:\s+abaixo)?\s+que\s+mostra\b/gi, "analisando o gráfico principal que mostra")
           .replace(/\bmini[\s\-]gr[áa]fico\b/gi, "gráfico principal");
  }

  // Se NÃO possui figura vetorial desenhada na questão:
  if(!figuraValida){
    // Suaviza menções residuais a "abaixo" para manter a fluidez da leitura
    en = en.replace(/\b(?:ilustrad[oa]\s+abaixo|mostrad[oa]\s+abaixo|a\s+seguir|ao\s+lado)\b/gi, "apresentado no contexto")
           .replace(/\babaixo\b/gi, "")
           .replace(/\s{2,}/g, " ")
           .trim();

    // Bloqueia apenas se for um comando quebrado sem texto (ex: "Veja a tirinha:" sem mais nada)
    const regexCascasQuebradas = [
      /^(?:veja|observe|analise)\s+a\s+tirinha\s*:?$/i,
      /^(?:veja|observe|analise)\s+o\s+verbete\s*:?$/i
    ];
    for(const padrao of regexCascasQuebradas){
      if(padrao.test(en)){
        return {
          valida: false,
          motivo: `Enunciado incompleto dependente de figura não gerada: "${en}"`,
          questao: { ...q, enunciado: en, figura: null }
        };
      }
    }
  }

  // Garante alternativas válidas (exatamente 5, não vazias)
  const alts = (q.alternativas || []).slice(0, 5).map(a => String(a).replace(/^[A-Ea-e][)\.\-\s]\s*/, "").trim());
  if(alts.length !== 5 || alts.some(a => !a)){
    return { valida: false, motivo: "Alternativas incompletas ou com menos de 5 opções", questao: q };
  }

  // Garante letra correta de A a E
  let correta = String(q.correta || "A").trim().toUpperCase().replace(/[^A-E]/g, "").charAt(0) || "A";

  return {
    valida: true,
    questao: {
      enunciado: en,
      figura: figuraValida,
      alternativas: alts,
      correta
    }
  };
}
