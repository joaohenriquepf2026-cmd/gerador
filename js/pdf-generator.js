/* ============================================================
   MOTOR DE LAYOUT E GERAÇÃO DE PDF (A4 · 150 DPI)
   Paginação dinâmica e folha exclusiva do gabarito oficial.
   ============================================================ */

const W = 1240, H = 1754, M = 96;

function novaPagina(){
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#f6f1e6";
  x.fillRect(0, 0, W, 26);
  x.fillStyle = "#0f7a6b";
  x.fillRect(0, 0, W, 10);
  x.fillStyle = "#f2b544";
  x.fillRect(0, H - 12, W, 12);
  return c;
}

function cabecalho(ctx, a, pag, total, semNome){
  // PÁGINA 1: Cabeçalho Completo com Bloco Institucional e Identificação do Aluno
  if(pag === 1){
    ctx.fillStyle = "#0f7a6b";
    ctx.fillRect(M, 70, W - 2 * M, 120);
    ctx.fillStyle = "#f2b544";
    ctx.fillRect(M, 70, 12, 120);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 40px Nunito, sans-serif";
    ctx.fillText(a.disciplina.toUpperCase(), M + 36, 122);
    ctx.font = "600 24px Nunito, sans-serif";
    ctx.fillStyle = "#d8f2ec";
    ctx.fillText(a.turma, M + 36, 160);
    ctx.textAlign = "right";
    ctx.font = "700 20px Nunito, sans-serif";
    ctx.fillText("Folha " + pag + "/" + total, W - M - 24, 160);
    ctx.textAlign = "left";

    if(semNome) return 262;
    ctx.strokeStyle = "#c9c0ae";
    ctx.lineWidth = 2;
    ctx.font = "600 20px Nunito, sans-serif";
    ctx.fillStyle = "#3a4a52";
    ctx.fillText("Nome:", M, 236);
    linha(ctx, M + 70, 240, W - M - 300, 240);
    ctx.fillText("Data: ___/___/_____", W - M - 210, 236);
    return 292;
  }

  // PÁGINAS SEGUINTES (2+): Cabeçalho Editorial Compacto de Livro Profissional
  ctx.fillStyle = "#0f7a6b";
  ctx.font = "800 22px Nunito, sans-serif";
  ctx.fillText(a.disciplina.toUpperCase(), M, 65);

  ctx.textAlign = "right";
  ctx.font = "600 19px Nunito, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(a.turma + "   ·   Folha " + pag + "/" + total, W - M, 65);
  ctx.textAlign = "left";

  // Linha horizontal divisória separando o cabeçalho do corpo da prova
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  linha(ctx, M, 80, W - M, 80);

  return 115;
}

function quebrarParagrafos(ctx, texto, largura, recuoPrimeiraLinha = 36){
  const blocos = String(texto || "").split(/\n+/).map(p => p.trim()).filter(Boolean);
  const linhas = [];
  blocos.forEach((p, pIdx) => {
    const palavras = p.split(/\s+/).filter(Boolean);
    let atual = "";
    let primeiraLinha = true;
    palavras.forEach(palavra => {
      const limite = primeiraLinha ? (largura - recuoPrimeiraLinha) : largura;
      const t = atual ? atual + " " + palavra : palavra;
      if(ctx.measureText(t).width > limite && atual){
        linhas.push({ texto: atual, recuo: primeiraLinha ? recuoPrimeiraLinha : 0 });
        atual = palavra;
        primeiraLinha = false;
      } else {
        atual = t;
      }
    });
    if(atual){
      linhas.push({ texto: atual, recuo: primeiraLinha ? recuoPrimeiraLinha : 0 });
    }
    if(pIdx < blocos.length - 1){
      linhas.push({ texto: "", recuo: 0, espacoExtra: 10 });
    }
  });
  return linhas;
}

function prepararIntroducao(ctx, a){
  ctx.font = "800 32px Nunito, sans-serif";
  const titulo = quebrar(ctx, a.titulo, W - 2 * M);
  ctx.font = "700 20px Nunito, sans-serif";
  const conteudo = quebrar(ctx, "Conteúdo: " + a.conteudo, W - 2 * M - 30);
  ctx.font = "600 19px Nunito, sans-serif";
  const objetivos = (a.objetivos || []).flatMap(o => quebrar(ctx, "• " + o, W - 2 * M - 26));
  ctx.font = "400 20px Nunito, sans-serif";
  const apoio = quebrarParagrafos(ctx, a.textoApoio || "", W - 2 * M - 36, 36);
  const hApoio = apoio.reduce((acc, l) => acc + (l.texto ? 29 : (l.espacoExtra || 14)), 0);

  let hExtra = 0;
  const temTab = a.tabela && a.tabela.colunas && a.tabela.linhas;
  const temGraf = a.grafico && a.grafico.dados && a.grafico.dados.length;

  if(temTab && temGraf){
    const hTab = 30 + 36 + Math.min(a.tabela.linhas.length, 6) * 32 + 20;
    const hGraf = 235;
    hExtra += Math.max(hTab, hGraf) + 20;
  } else if(temTab){
    hExtra += 30 + 36 + a.tabela.linhas.length * 32 + 25;
  } else if(temGraf){
    hExtra += 235;
  }

  const altura = titulo.length * 40 + conteudo.length * 28 + objetivos.length * 27 + hApoio + 165 + hExtra;
  return { titulo, conteudo, objetivos, apoio, altura, tabela: a.tabela, grafico: a.grafico };
}

function desenharIntroducao(ctx, intro, y){
  ctx.fillStyle = "#20303a";
  ctx.font = "800 32px Nunito, sans-serif";
  intro.titulo.forEach(l => { ctx.fillText(l, M, y); y += 40; });
  y += 8;

  ctx.fillStyle = "#eef7f4";
  const hConteudo = intro.conteudo.length * 28 + 20;
  ctx.fillRect(M, y - 20, W - 2 * M, hConteudo);
  ctx.fillStyle = "#0a5a4f";
  ctx.font = "700 20px Nunito, sans-serif";
  intro.conteudo.forEach(l => { ctx.fillText(l, M + 16, y); y += 28; });
  y += 24;

  ctx.fillStyle = "#20303a";
  ctx.font = "800 20px Nunito, sans-serif";
  ctx.fillText("OBJETIVOS DE APRENDIZAGEM", M, y);
  y += 30;

  ctx.font = "600 19px Nunito, sans-serif";
  ctx.fillStyle = "#3a4a52";
  intro.objetivos.forEach(l => { ctx.fillText(l, M + 10, y); y += 27; });
  y += 18;

  ctx.fillStyle = "#e4572e";
  ctx.font = "800 19px Nunito, sans-serif";
  ctx.fillText("LEIA, ANALISE E RESPONDA", M, y);
  y += 29;

  ctx.fillStyle = "#2c3c45";
  ctx.font = "400 20px Nunito, sans-serif";
  intro.apoio.forEach(l => {
    if(l.texto){
      ctx.fillText(l.texto, M + 10 + (l.recuo || 0), y);
      y += 29;
    } else {
      y += l.espacoExtra || 14;
    }
  });
  y += 12;

  // Renderiza tabela e gráfico visual (lado a lado se ambos existirem)
  const temTab = intro.tabela && intro.tabela.colunas && intro.tabela.linhas;
  const temGraf = intro.grafico && intro.grafico.dados && intro.grafico.dados.length;

  if(temTab && temGraf){
    const gap = 24;
    const largCol = (W - 2 * M - gap) / 2;
    const yInicio = y;
    const yTab = desenharTabela(ctx, intro.tabela, M, yInicio, largCol);
    const yGraf = desenharGrafico(ctx, intro.grafico, M + largCol + gap, yInicio, largCol);
    y = Math.max(yTab, yGraf) + 10;
  } else {
    if(temTab){
      y = desenharTabela(ctx, intro.tabela, M, y, W - 2 * M);
    }
    if(temGraf){
      y = desenharGrafico(ctx, intro.grafico, M, y, W - 2 * M);
    }
  }

  ctx.strokeStyle = "#e6ddcd";
  ctx.lineWidth = 2;
  linha(ctx, M, y + 12, W - M, y + 12);
  return y + 48;
}

function desenhar(a){
  const medidor = novaPagina().getContext("2d");
  const intro = prepararIntroducao(medidor, a);
  const largQ = W - 2 * M - 56;

  const blocos = a.questoes.map((q, i) => {
    medidor.font = "700 24px Nunito, sans-serif";
    const en = quebrar(medidor, (i + 1) + ". " + q.enunciado, W - 2 * M);
    medidor.font = "400 23px Nunito, sans-serif";
    const alts = q.alternativas.map((t, j) => quebrar(medidor, ("ABCDE"[j] || "A") + ") " + t, largQ));

    let hFigura = 0;
    // Validação estrita: somente reserva espaço se a figura de fato possuir dados válidos!
    if(figuraPossuiDadosValidos(q.figura)){
      if(q.figura.tipo === "reta_numerica") hFigura = 116;
      else if(q.figura.tipo === "relogio") hFigura = 171;
      else if(q.figura.tipo === "forma_geometrica") hFigura = 161;
      else if(q.figura.tipo === "mini_grafico") hFigura = 161;
      else if(q.figura.tipo === "rosa_dos_ventos") hFigura = 171;
      else if(q.figura.tipo === "cadeia_alimentar") hFigura = 121;
      else if(q.figura.tipo === "fracao_visual") hFigura = 146;
      else if(q.figura.tipo === "balanca_medicao") hFigura = 136;
      else if(q.figura.tipo === "baloes_dialogo") hFigura = 156;
      else if(q.figura.tipo === "verbete_dicionario") hFigura = 141;
      else if(q.figura.tipo === "linha_do_tempo") hFigura = 126;
      else if(q.figura.tipo === "ficha_fonte") hFigura = 136;
      else if(q.figura.tipo === "ciclo_esquema") hFigura = 136;
      else if(q.figura.tipo === "circulo_cromatico") hFigura = 136;
      else if(q.figura.tipo === "quadro_reflexivo") hFigura = 136;
    }

    const altura = en.length * 34 + 12 + hFigura + alts.reduce((s, l) => s + l.length * 32, 0) + 30;
    return { en, figura: figuraPossuiDadosValidos(q.figura) ? q.figura : null, hFigura, alts, altura };
  });

  const canvases = [];
  let idx = 0;
  const paginasDados = [];
  while(idx < blocos.length){
    const primeira = paginasDados.length === 0;
    const grupo = [];
    let y = (primeira ? 292 + intro.altura : 115);
    while(idx < blocos.length && y + blocos[idx].altura < H - 120){
      grupo.push(blocos[idx]);
      y += blocos[idx].altura;
      idx++;
    }
    if(!grupo.length){
      grupo.push(blocos[idx]);
      idx++;
    }
    paginasDados.push({ grupo, primeira });
  }
  const total = paginasDados.length + 1; // + gabarito oficial

  paginasDados.forEach((dados, p) => {
    const c = novaPagina();
    const ctx = c.getContext("2d");
    let y = cabecalho(ctx, a, p + 1, total);
    if(dados.primeira) y = desenharIntroducao(ctx, intro, y);
    dados.grupo.forEach(b => {
      ctx.fillStyle = "#20303a";
      ctx.font = "700 24px Nunito, sans-serif";
      b.en.forEach(l => { ctx.fillText(l, M, y); y += 34; });
      y += 10;

      // Renderiza figura somente se for válida (Zero objetos fantasmas!)
      if(b.figura && b.hFigura > 0){
        y = desenharFiguraQuestao(ctx, b.figura, M, y, W - 2 * M);
      }

      ctx.font = "400 23px Nunito, sans-serif";
      ctx.fillStyle = "#2c3c45";
      b.alts.forEach(linhas => {
        linhas.forEach((l, k) => {
          if(k === 0){
            ctx.strokeStyle = "#9aa8ae";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(M + 18, y - 8, 10, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillText(l, M + 44, y);
          y += 32;
        });
      });
      y += 20;
    });
    canvases.push(c);
  });

  // FOLHA DO PROFESSOR (GABARITO E PAINEL DE REGISTRO PEDAGÓGICO)
  const c = novaPagina();
  const ctx = c.getContext("2d");
  let y = cabecalho(ctx, a, total, total, true);
  ctx.fillStyle = "#e4572e";
  ctx.fillRect(M, y - 30, W - 2 * M, 58);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 30px Nunito, sans-serif";
  ctx.fillText("FOLHA DO PROFESSOR · GABARITO OFICIAL", M + 22, y + 9);
  y += 80;

  const colW = (W - 2 * M) / 2;
  a.questoes.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * colW, yy = y + row * 68;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(x, yy - 32, colW - 24, 52);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, yy - 32, colW - 24, 52);
    ctx.fillStyle = "#20303a";
    ctx.font = "700 24px Nunito, sans-serif";
    ctx.fillText("Questão " + (i + 1), x + 18, yy + 4);
    ctx.fillStyle = "#0f7a6b";
    ctx.beginPath();
    ctx.arc(x + colW - 65, yy - 6, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(q.correta, x + colW - 65, yy + 2);
    ctx.textAlign = "left";
  });
  y += 5 * 68 + 40;

  // Painel de Registro Pedagógico da Turma (BNCC)
  ctx.fillStyle = "#0f7a6b";
  ctx.fillRect(M, y, W - 2 * M, 44);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 22px Nunito, sans-serif";
  ctx.fillText("REGISTRO DE DESEMPENHO E INTERVENÇÃO PEDAGÓGICA (BNCC)", M + 18, y + 30);
  y += 44;

  ctx.fillStyle = "#fdfbf7";
  ctx.fillRect(M, y, W - 2 * M, 320);
  ctx.strokeStyle = "#d6cfc4";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(M, y, W - 2 * M, 320);

  ctx.font = "700 18px Nunito, sans-serif";
  ctx.fillStyle = "#20303a";
  ctx.fillText("Disciplina / Conteúdo: " + a.disciplina + " — " + a.conteudo, M + 24, y + 36);
  ctx.fillText("Turma: " + a.turma, M + 24, y + 68);
  ctx.fillText("Total de Alunos Avaliados: ______", M + 24, y + 100);
  ctx.fillText("Média de Acertos da Turma: ______ / 10", M + 450, y + 100);

  ctx.font = "700 18px Nunito, sans-serif";
  ctx.fillStyle = "#0a5a4f";
  ctx.fillText("Habilidades e Objetivos Trabalhados:", M + 24, y + 140);
  ctx.font = "600 16px Nunito, sans-serif";
  ctx.fillStyle = "#334155";
  (a.objetivos || []).slice(0, 2).forEach((obj, oi) => {
    ctx.fillText("• " + obj.slice(0, 95), M + 36, y + 168 + oi * 26);
  });

  ctx.font = "700 18px Nunito, sans-serif";
  ctx.fillStyle = "#e4572e";
  ctx.fillText("Anotações para Recuperação Paralela e Retomada de Conteúdo:", M + 24, y + 230);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  linha(ctx, M + 24, y + 265, W - M - 24, y + 265);
  linha(ctx, M + 24, y + 298, W - M - 24, y + 298);

  ctx.fillStyle = "#6d7f89";
  ctx.font = "400 18px Nunito, sans-serif";
  ctx.fillText("Documento exclusivo do professor — Guarde para o conselho de classe e planejamento pedagógico.", M, H - 80);
  canvases.push(c);

  return canvases;
}

/* ============================================================
   DOWNLOAD EM PDF (BINÁRIO COMPILADO CLIENT-SIDE)
   ============================================================ */
function juntarBytes(partes){
  const total = partes.reduce((s, p) => s + p.length, 0);
  const saida = new Uint8Array(total);
  let pos = 0;
  partes.forEach(p => { saida.set(p, pos); pos += p.length; });
  return saida;
}

function textoBytes(s){ return new TextEncoder().encode(s); }

function jpegBytes(canvas){
  const b64 = canvas.toDataURL("image/jpeg", 0.94).split(",")[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function criarPDF(canvases){
  const objetos = [];
  objetos[1] = textoBytes("<< /Type /Catalog /Pages 2 0 R >>");
  const ids = canvases.map((_, i) => 3 + i * 3);
  objetos[2] = textoBytes(`<< /Type /Pages /Kids [${ids.map(id => id + " 0 R").join(" ")}] /Count ${ids.length} >>`);
  canvases.forEach((canvas, i) => {
    const pageId = 3 + i * 3, imageId = pageId + 1, contentId = pageId + 2;
    const jpg = jpegBytes(canvas);
    const comandos = textoBytes("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n");
    objetos[pageId] = textoBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objetos[imageId] = juntarBytes([
      textoBytes(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),
      jpg, textoBytes("\nendstream")
    ]);
    objetos[contentId] = juntarBytes([textoBytes(`<< /Length ${comandos.length} >>\nstream\n`), comandos, textoBytes("endstream")]);
  });

  const partes = [textoBytes("%PDF-1.4\n%MuleAtividade\n")], offsets = [0];
  let tamanho = partes[0].length;
  for(let id = 1; id < objetos.length; id++){
    offsets[id] = tamanho;
    const obj = juntarBytes([textoBytes(`${id} 0 obj\n`), objetos[id], textoBytes("\nendobj\n")]);
    partes.push(obj);
    tamanho += obj.length;
  }
  const xref = tamanho;
  let tabela = `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for(let id = 1; id < objetos.length; id++) tabela += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  tabela += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  partes.push(textoBytes(tabela));
  return new Blob(partes, { type: "application/pdf" });
}

function baixar(){
  if(!paginas.length) return;
  const base = (atividade.disciplina + "-" + atividade.conteudo + "-" + atividade.turma)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  const url = URL.createObjectURL(criarPDF(paginas));
  const a = document.createElement("a");
  a.href = url;
  a.download = base + ".pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  msg("PDF baixado com " + paginas.length + " páginas, incluindo o gabarito oficial.");
}
