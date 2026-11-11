/* ============================================================
   MOTOR VISUAL MODULAR DE GRÁFICOS ESTATÍSTICOS E MEDIÇÕES (BNCC)
   Suporte Completo:
   1. Colunas Verticais (com margens alargadas anti-truncamento)
   2. Barras Horizontais
   3. Linhas de Tendência / Evolução Temporal
   4. Setores Circulares (Pizza com Porcentagens e Legenda)
   5. Régua Graduada de Precisão (cm e mm)
   6. Pictograma com Símbolos
   ============================================================ */

const CORES_PALETA_GRAFICOS = [
  "#0f7a6b", // Verde Petróleo
  "#e4572e", // Laranja Coral
  "#f2b544", // Amarelo Dourado
  "#3b82f6", // Azul Cobalto
  "#8b5cf6", // Roxo Ametista
  "#10b981", // Esmeralda
  "#ec4899", // Rosa Framboesa
  "#06b6d4"  // Ciano
];

/**
 * Renderiza gráfico completo no Canvas do PDF ou em Canvas isolado para Word
 */
function desenharGraficoEstatistico(ctx, g, x, y, larg, altDisponivel = 220){
  if(!g || !Array.isArray(g.dados) || g.dados.length === 0) return y;

  const tipo = String(g.tipoGrafico || g.tipo || "colunas").toLowerCase();
  
  if(tipo.includes("linha")){
    return desenharGraficoLinhas(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("barra") || tipo.includes("horizontal")){
    return desenharGraficoBarrasHorizontais(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("pizza") || tipo.includes("setor")){
    return desenharGraficoPizza(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("rosca") || tipo.includes("donut")){
    return desenharGraficoRosca(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("picto") || tipo.includes("simbolo")){
    return desenharPictograma(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("climo") || tipo.includes("clima") || tipo.includes("chuva")){
    return desenharClimograma(ctx, g, x, y, larg, altDisponivel);
  } else if(tipo.includes("regua") || tipo.includes("régua")){
    return desenharReguaGraduada(ctx, g, x, y, larg, 110);
  } else {
    return desenharGraficoColunas(ctx, g, x, y, larg, altDisponivel);
  }
}

/**
 * 1. GRÁFICO DE COLUNAS VERTICAIS (com espaço generoso anti-corte de rótulos)
 */
function desenharGraficoColunas(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  const margemEsq = 55;
  const margemDir = 25;
  const margemSup = 40;
  const margemInf = 42; // margem inferior ampliada para caber nomes completos

  const wEfetivo = larg - margemEsq - margemDir;
  const hEfetivo = hGrafico - margemSup - margemInf;

  // Fundo e Borda
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const maxVal = Math.max(...valores, 10);
  const escalaMax = Math.ceil(maxVal * 1.18);

  const origemX = x + margemEsq;
  const origemY = y + hGrafico - margemInf;

  // Eixos X e Y
  ctx.strokeStyle = "#20303a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origemX, y + margemSup - 10);
  ctx.lineTo(origemX, origemY);
  ctx.lineTo(origemX + wEfetivo, origemY);
  ctx.stroke();

  // Linhas guia horizontais e valores do eixo Y
  ctx.font = "600 13px Nunito, sans-serif";
  ctx.fillStyle = "#6d7f89";
  for(let i = 0; i <= 4; i++){
    const valLinha = Math.round((escalaMax / 4) * i);
    const yPos = origemY - (hEfetivo / 4) * i;
    ctx.strokeStyle = "#e8e1d3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origemX, yPos);
    ctx.lineTo(origemX + wEfetivo, yPos);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(String(valLinha), origemX - 8, yPos + 4);
  }
  ctx.textAlign = "left";

  // Barras verticais
  const numBarras = g.dados.length;
  const espacoBarra = wEfetivo / numBarras;
  const larguraBarra = Math.min(espacoBarra * 0.62, 55);

  g.dados.forEach((d, idx) => {
    const valor = Number(d.valor) || 0;
    const hBarra = (valor / escalaMax) * hEfetivo;
    const xBarra = origemX + idx * espacoBarra + (espacoBarra - larguraBarra) / 2;
    const yBarra = origemY - hBarra;

    ctx.fillStyle = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];
    ctx.fillRect(xBarra, yBarra, larguraBarra, hBarra);

    // Borda sutil na barra
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(xBarra, yBarra, larguraBarra, hBarra);

    // Valor acima da barra
    ctx.font = "800 14px Nunito, sans-serif";
    ctx.fillStyle = "#20303a";
    ctx.textAlign = "center";
    ctx.fillText(String(valor), xBarra + larguraBarra / 2, yBarra - 6);

    // Rótulo abaixo da barra com quebra inteligente anti-corte
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillStyle = "#334155";
    const rotuloCompleto = String(d.rotulo || "").trim();
    if(rotuloCompleto.length > 10 && rotuloCompleto.includes(" ")){
      const partes = rotuloCompleto.split(" ");
      ctx.fillText(partes[0], xBarra + larguraBarra / 2, origemY + 16);
      ctx.fillText(partes.slice(1).join(" "), xBarra + larguraBarra / 2, origemY + 30);
    } else {
      ctx.fillText(rotuloCompleto.slice(0, 14), xBarra + larguraBarra / 2, origemY + 20);
    }
  });

  ctx.textAlign = "left";
  return y + hGrafico + 20;
}

/**
 * 2. GRÁFICO DE BARRAS HORIZONTAIS (Excelente para itens com nomes mais longos)
 */
function desenharGraficoBarrasHorizontais(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  const margemEsq = 120; // Espaço para os rótulos à esquerda
  const margemDir = 45;
  const margemSup = 35;
  const margemInf = 30;

  const wEfetivo = larg - margemEsq - margemDir;
  const hEfetivo = hGrafico - margemSup - margemInf;

  // Fundo e Borda
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const maxVal = Math.max(...valores, 10);
  const escalaMax = Math.ceil(maxVal * 1.15);

  const origemX = x + margemEsq;
  const origemY = y + hGrafico - margemInf;

  // Eixos
  ctx.strokeStyle = "#20303a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origemX, y + margemSup - 5);
  ctx.lineTo(origemX, origemY);
  ctx.lineTo(origemX + wEfetivo, origemY);
  ctx.stroke();

  const numBarras = g.dados.length;
  const espacoBarra = hEfetivo / numBarras;
  const alturaBarra = Math.min(espacoBarra * 0.65, 26);

  g.dados.forEach((d, idx) => {
    const valor = Number(d.valor) || 0;
    const wBarra = (valor / escalaMax) * wEfetivo;
    const yBarra = y + margemSup + idx * espacoBarra + (espacoBarra - alturaBarra) / 2;

    ctx.fillStyle = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];
    ctx.fillRect(origemX, yBarra, wBarra, alturaBarra);

    // Rótulo à esquerda
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.fillText(String(d.rotulo || "").slice(0, 16), origemX - 10, yBarra + alturaBarra / 2 + 4);

    // Valor à direita da barra
    ctx.font = "800 13px Nunito, sans-serif";
    ctx.fillStyle = "#20303a";
    ctx.textAlign = "left";
    ctx.fillText(String(valor), origemX + wBarra + 8, yBarra + alturaBarra / 2 + 4);
  });

  ctx.textAlign = "left";
  return y + hGrafico + 20;
}

/**
 * 3. GRÁFICO DE LINHAS (Evolução contínua, histórico, medições de tempo)
 */
function desenharGraficoLinhas(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  const margemEsq = 55;
  const margemDir = 35;
  const margemSup = 40;
  const margemInf = 38;

  const wEfetivo = larg - margemEsq - margemDir;
  const hEfetivo = hGrafico - margemSup - margemInf;

  // Fundo e Borda
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const maxVal = Math.max(...valores, 10);
  const escalaMax = Math.ceil(maxVal * 1.18);

  const origemX = x + margemEsq;
  const origemY = y + hGrafico - margemInf;

  // Grade e Valores Y
  ctx.font = "600 13px Nunito, sans-serif";
  ctx.fillStyle = "#6d7f89";
  for(let i = 0; i <= 4; i++){
    const valLinha = Math.round((escalaMax / 4) * i);
    const yPos = origemY - (hEfetivo / 4) * i;
    ctx.strokeStyle = "#e8e1d3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origemX, yPos);
    ctx.lineTo(origemX + wEfetivo, yPos);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(String(valLinha), origemX - 8, yPos + 4);
  }

  // Eixo X e Y principais
  ctx.strokeStyle = "#20303a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origemX, y + margemSup - 10);
  ctx.lineTo(origemX, origemY);
  ctx.lineTo(origemX + wEfetivo, origemY);
  ctx.stroke();

  const numPontos = g.dados.length;
  const stepX = wEfetivo / (numPontos > 1 ? numPontos - 1 : 1);
  const pontosCalculados = [];

  g.dados.forEach((d, idx) => {
    const valor = Number(d.valor) || 0;
    const px = origemX + (numPontos > 1 ? idx * stepX : wEfetivo / 2);
    const py = origemY - (valor / escalaMax) * hEfetivo;
    pontosCalculados.push({ x: px, y: py, valor, rotulo: d.rotulo });
  });

  // Linha contínua
  ctx.strokeStyle = "#0f7a6b";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  pontosCalculados.forEach((p, idx) => {
    if(idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // Vértices circulares e valores
  pontosCalculados.forEach((p) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e4572e";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Valor acima do ponto
    ctx.font = "800 13px Nunito, sans-serif";
    ctx.fillStyle = "#20303a";
    ctx.textAlign = "center";
    ctx.fillText(String(p.valor), p.x, p.y - 10);

    // Rótulo abaixo do eixo X
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(String(p.rotulo || "").slice(0, 10), p.x, origemY + 20);
  });

  ctx.textAlign = "left";
  return y + hGrafico + 20;
}

/**
 * 4. GRÁFICO DE SETORES (PIZZA) COM PORCENTAGENS E LEGENDA
 */
function desenharGraficoPizza(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const total = valores.reduce((acc, v) => acc + v, 0) || 1;

  const centroX = x + larg * 0.32;
  const centroY = y + hGrafico / 2;
  const raio = Math.min(hGrafico * 0.38, 70);

  let anguloInicial = -Math.PI / 2;

  g.dados.forEach((d, idx) => {
    const valor = Number(d.valor) || 0;
    const anguloFatia = (valor / total) * (Math.PI * 2);
    const anguloFinal = anguloInicial + anguloFatia;
    const cor = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];

    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(centroX, centroY);
    ctx.arc(centroX, centroY, raio, anguloInicial, anguloFinal);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rótulo da porcentagem no arco se houver espaço
    if(anguloFatia > 0.35){
      const anguloMeio = anguloInicial + anguloFatia / 2;
      const rx = centroX + Math.cos(anguloMeio) * (raio * 0.65);
      const ry = centroY + Math.sin(anguloMeio) * (raio * 0.65);
      const pct = Math.round((valor / total) * 100) + "%";
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 12px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pct, rx, ry);
    }

    anguloInicial = anguloFinal;
  });

  // Legenda lateral organizada
  ctx.textBaseline = "alphabetic";
  const legX = x + larg * 0.62;
  const itemH = 24;
  const startLegY = y + (hGrafico - g.dados.length * itemH) / 2 + 10;

  g.dados.forEach((d, idx) => {
    const cor = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];
    const ly = startLegY + idx * itemH;

    ctx.fillStyle = cor;
    ctx.fillRect(legX, ly - 10, 14, 14);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(legX, ly - 10, 14, 14);

    ctx.fillStyle = "#20303a";
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.textAlign = "left";
    const pct = Math.round(((Number(d.valor) || 0) / total) * 100);
    ctx.fillText(`${String(d.rotulo).slice(0, 14)} (${d.valor} · ${pct}%)`, legX + 22, ly + 2);
  });

  return y + hGrafico + 20;
}

/**
 * 5. RÉGUA GRADUADA DE PRECISÃO (Centímetros e Milímetros)
 */
function desenharReguaGraduada(ctx, g, x, y, larg, altTotal){
  const hBox = altTotal || 110;
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(x, y, larg, hBox);
  ctx.strokeStyle = "#e5dfd3";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hBox);

  const cmTotal = Number(g.cmTotal || 12);
  const margemX = 40;
  const reguaW = larg - 2 * margemX;
  const reguaY = y + 24;
  const reguaH = 50;

  // Corpo da régua
  ctx.fillStyle = "#fef08a"; // Amarelo madeira/plástico escolar
  ctx.fillRect(x + margemX, reguaY, reguaW, reguaH);
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + margemX, reguaY, reguaW, reguaH);

  const pxPorCm = reguaW / cmTotal;
  ctx.fillStyle = "#1e293b";
  ctx.font = "700 12px Nunito, sans-serif";
  ctx.textAlign = "center";

  for(let c = 0; c <= cmTotal; c++){
    const cmX = x + margemX + c * pxPorCm;

    // Marca de centímetro (tick longo)
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cmX, reguaY);
    ctx.lineTo(cmX, reguaY + 18);
    ctx.stroke();

    ctx.fillText(String(c), cmX, reguaY + 34);

    // Marcas de milímetros (ticks curtos)
    if(c < cmTotal){
      for(let m = 1; m < 10; m++){
        const mmX = cmX + (m * pxPorCm) / 10;
        const tickH = m === 5 ? 12 : 7;
        ctx.strokeStyle = m === 5 ? "#475569" : "#94a3b8";
        ctx.lineWidth = m === 5 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(mmX, reguaY);
        ctx.lineTo(mmX, reguaY + tickH);
        ctx.stroke();
      }
    }
  }

  // Objeto de medição em destaque se fornecido (ex: lápis, clipe)
  if(g.medicaoObjeto){
    const medCm = Number(g.medicaoObjeto.comprimentoCm || 5);
    const inicioCm = Number(g.medicaoObjeto.inicioCm || 0);
    const obX1 = x + margemX + inicioCm * pxPorCm;
    const obX2 = obX1 + medCm * pxPorCm;
    const obY = reguaY + reguaH + 12;

    ctx.strokeStyle = "#0f7a6b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(obX1, obY);
    ctx.lineTo(obX2, obY);
    ctx.stroke();

    ctx.fillStyle = "#0f7a6b";
    ctx.beginPath(); ctx.arc(obX1, obY, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(obX2, obY, 4, 0, Math.PI*2); ctx.fill();

    ctx.font = "800 13px Nunito, sans-serif";
    ctx.fillText(String(g.medicaoObjeto.nome || "Objeto Medido"), (obX1 + obX2) / 2, obY + 16);
  }

  ctx.textAlign = "left";
  return y + hBox + 20;
}

/**
 * 6. GRÁFICO DE ROSCA (DONUT) COM TOTALIZADOR CENTRAL
 */
function desenharGraficoRosca(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const total = valores.reduce((acc, v) => acc + v, 0) || 1;

  const centroX = x + larg * 0.32;
  const centroY = y + hGrafico / 2;
  const raioExt = Math.min(hGrafico * 0.38, 70);
  const raioInt = raioExt * 0.52;

  let anguloInicial = -Math.PI / 2;

  g.dados.forEach((d, idx) => {
    const valor = Number(d.valor) || 0;
    const anguloFatia = (valor / total) * (Math.PI * 2);
    const anguloFinal = anguloInicial + anguloFatia;
    const cor = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];

    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(centroX, centroY, raioExt, anguloInicial, anguloFinal);
    ctx.arc(centroX, centroY, raioInt, anguloFinal, anguloInicial, true);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    anguloInicial = anguloFinal;
  });

  // Centro da rosca com o total
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(centroX, centroY, raioInt - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#20303a";
  ctx.font = "800 15px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TOTAL", centroX, centroY - 8);
  ctx.font = "800 17px Nunito, sans-serif";
  ctx.fillStyle = "#0f7a6b";
  ctx.fillText(String(total), centroX, centroY + 10);

  // Legenda lateral
  ctx.textBaseline = "alphabetic";
  const legX = x + larg * 0.62;
  const itemH = 24;
  const startLegY = y + (hGrafico - g.dados.length * itemH) / 2 + 10;

  g.dados.forEach((d, idx) => {
    const cor = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];
    const ly = startLegY + idx * itemH;

    ctx.fillStyle = cor;
    ctx.fillRect(legX, ly - 10, 14, 14);
    ctx.fillStyle = "#20303a";
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.textAlign = "left";
    const pct = Math.round(((Number(d.valor) || 0) / total) * 100);
    ctx.fillText(`${String(d.rotulo).slice(0, 14)} (${d.valor} · ${pct}%)`, legX + 22, ly + 2);
  });

  return y + hGrafico + 20;
}

/**
 * 7. PICTOGRAMA (Ícones visuais repetidos padrão SAEB/BNCC)
 */
function desenharPictograma(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 210;
  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const valores = g.dados.map(d => Number(d.valor) || 0);
  const maxVal = Math.max(...valores, 1);
  const valorPorIcone = maxVal > 50 ? 10 : (maxVal > 20 ? 5 : 1);
  const iconeSimbolo = g.icone || "★";

  // Cabeçalho da legenda do pictograma
  ctx.fillStyle = "#0f7a6b";
  ctx.font = "800 12px Nunito, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Legenda: Cada ${iconeSimbolo} equivale a ${valorPorIcone} unidades`, x + larg - 20, y + 22);

  const margemEsq = 120;
  const numLinhas = g.dados.length;
  const espacoLinha = (hGrafico - 40) / numLinhas;

  g.dados.forEach((d, idx) => {
    const ly = y + 42 + idx * espacoLinha;
    const valor = Number(d.valor) || 0;
    const qtdIcones = Math.min(10, Math.round(valor / valorPorIcone));

    // Rótulo da linha
    ctx.font = "700 13px Nunito, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.fillText(String(d.rotulo).slice(0, 15), x + margemEsq - 15, ly + 14);

    // Ícones desenhados
    ctx.font = "18px sans-serif";
    ctx.fillStyle = CORES_PALETA_GRAFICOS[idx % CORES_PALETA_GRAFICOS.length];
    ctx.textAlign = "left";
    let iconesStr = "";
    for(let k = 0; k < qtdIcones; k++) iconesStr += iconeSimbolo + " ";
    ctx.fillText(iconesStr, x + margemEsq, ly + 15);

    // Valor numérico total no final da linha
    ctx.font = "800 13px Nunito, sans-serif";
    ctx.fillStyle = "#20303a";
    ctx.fillText(`(${valor})`, x + margemEsq + qtdIcones * 22 + 8, ly + 14);
  });

  return y + hGrafico + 20;
}

/**
 * 8. CLIMOGRAMA (Colunas de Chuva em Azul + Linha de Temperatura em Vermelho)
 */
function desenharClimograma(ctx, g, x, y, larg, altTotal){
  const hGrafico = altTotal || 215;
  const margemEsq = 50;
  const margemDir = 50;
  const margemSup = 40;
  const margemInf = 38;

  const wEfetivo = larg - margemEsq - margemDir;
  const hEfetivo = hGrafico - margemSup - margemInf;

  ctx.fillStyle = "#fafcfc";
  ctx.fillRect(x, y, larg, hGrafico);
  ctx.strokeStyle = "#e2d9c8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, larg, hGrafico);

  const origemX = x + margemEsq;
  const origemY = y + hGrafico - margemInf;

  // Eixos e grade
  ctx.strokeStyle = "#20303a";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(origemX, y + margemSup - 5);
  ctx.lineTo(origemX, origemY);
  ctx.lineTo(origemX + wEfetivo, origemY);
  ctx.lineTo(origemX + wEfetivo, y + margemSup - 5);
  ctx.stroke();

  // Eixo Y esquerdo (Chuva mm)
  ctx.fillStyle = "#0284c7";
  ctx.font = "700 11px Nunito, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Chuva (mm)", origemX - 8, y + margemSup - 10);

  // Eixo Y direito (Temp °C)
  ctx.fillStyle = "#dc2626";
  ctx.textAlign = "left";
  ctx.fillText("Temp (°C)", origemX + wEfetivo + 8, y + margemSup - 10);

  const numMeses = g.dados.length;
  const stepX = wEfetivo / numMeses;
  const barW = stepX * 0.55;

  const valoresChuva = g.dados.map(d => Number(d.valor) || 0);
  const maxChuva = Math.max(...valoresChuva, 150);
  const pontosTemp = [];

  g.dados.forEach((d, i) => {
    const valChuva = Number(d.valor) || 0;
    const hBarra = (valChuva / maxChuva) * hEfetivo;
    const bx = origemX + i * stepX + (stepX - barW) / 2;
    const by = origemY - hBarra;

    // Coluna azul de chuva
    ctx.fillStyle = "rgba(2, 132, 199, 0.75)";
    ctx.fillRect(bx, by, barW, hBarra);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, hBarra);

    // Mês / Rótulo
    ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "center";
    ctx.fillText(String(d.rotulo).slice(0, 3), bx + barW / 2, origemY + 16);

    // Temperatura simulada (ou fornecida em d.temperatura)
    const tempVal = Number(d.temperatura || (20 + Math.sin(i) * 6));
    const py = origemY - (tempVal / 40) * hEfetivo;
    pontosTemp.push({ x: bx + barW / 2, y: py, temp: tempVal });
  });

  // Linha vermelha de temperatura
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.beginPath();
  pontosTemp.forEach((p, idx) => {
    if(idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // Pontos vermelhos
  pontosTemp.forEach(p => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2; ctx.stroke();
  });

  return y + hGrafico + 20;
}

/**
 * Cria Canvas isolado para geração de imagem de gráfico em alta resolução para Word/PDF
 */
function gerarImagemGraficoEstatisticoCanvas(grafico){
  if(!grafico || !Array.isArray(grafico.dados) || grafico.dados.length === 0) return null;

  const w = 560;
  const h = 260;
  const c = document.createElement("canvas");
  c.width = w * 2; // 2x para nitidez Retina / Impressão
  c.height = h * 2;
  const ctx = c.getContext("2d");
  ctx.scale(2, 2);

  desenharGraficoEstatistico(ctx, grafico, 0, 0, w, h - 20);
  return c;
}
