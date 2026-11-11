/* ============================================================
   HISTÓRICO LOCAL (7 DIAS COM AUTO-EXPURGO) E CONTADOR DIÁRIO
   ============================================================ */

function obterChaveDataHoje(){
  const hoje = new Date();
  return hoje.toISOString().slice(0, 10); // YYYY-MM-DD
}

function carregarContadorHoje(){
  const dataHoje = obterChaveDataHoje();
  const dados = JSON.parse(localStorage.getItem("contador_provas_diarias") || "{}");
  const el = document.getElementById("qtdProvasHoje");
  if(el){
    el.textContent = dados[dataHoje] || 0;
  }
}

function incrementarContadorHoje(){
  const dataHoje = obterChaveDataHoje();
  const dados = JSON.parse(localStorage.getItem("contador_provas_diarias") || "{}");
  dados[dataHoje] = (dados[dataHoje] || 0) + 1;
  // Limpa datas antigas no contador para manter leve
  Object.keys(dados).forEach(d => {
    if(d !== dataHoje) delete dados[d];
  });
  localStorage.setItem("contador_provas_diarias", JSON.stringify(dados));
  carregarContadorHoje();
}

function carregarHistorico7Dias(){
  try{
    const lista = JSON.parse(localStorage.getItem("historico_provas_7d") || "[]");
    const seteDiasAtras = Date.now() - (7 * 24 * 60 * 60 * 1000);
    // Auto-expurgo preventivo: descarta o que for mais antigo que 7 dias
    const filtrada = lista.filter(item => item.timestamp && item.timestamp >= seteDiasAtras);
    if(filtrada.length !== lista.length){
      localStorage.setItem("historico_provas_7d", JSON.stringify(filtrada));
    }
    return filtrada;
  }catch(e){
    console.warn("Erro ao ler histórico local:", e);
    return [];
  }
}

function salvarNoHistorico7Dias(atv){
  try{
    const lista = carregarHistorico7Dias();
    const novoRegistro = {
      id: "atv_" + Date.now(),
      timestamp: Date.now(),
      dataStr: new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      turma: atv.turma,
      disciplina: atv.disciplina,
      conteudo: atv.conteudo,
      titulo: atv.titulo,
      atividade: atv
    };
    lista.unshift(novoRegistro);
    const limitada = lista.slice(0, 20);
    localStorage.setItem("historico_provas_7d", JSON.stringify(limitada));
    renderizarHistorico();
  }catch(e){
    console.warn("Falha ao salvar no histórico local de 7 dias:", e);
  }
}

function carregarAtividadeDoHistorico(id){
  const lista = carregarHistorico7Dias();
  const encontrada = lista.find(it => it.id === id);
  if(!encontrada || !encontrada.atividade) return;
  
  atividade = encontrada.atividade;
  turmaSel = atividade.turma;
  discSel = atividade.disciplina;
  conteudoSel = atividade.conteudo;
  
  paginas = desenhar(atividade);
  elPrev.innerHTML = "";
  paginas.forEach(c => elPrev.appendChild(c));
  estado(discSel, "ready", "Atividade pronta ✓");
  btnBaixar.disabled = false;
  if(btnBaixarDocx) btnBaixarDocx.disabled = false;
  btnRefazer.disabled = false;
  msg(`Atividade recuperada do histórico (${encontrada.dataStr}): ${paginas.length} páginas prontas.`);
  elPrev.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderizarHistorico(){
  const container = document.getElementById("historicoItems");
  if(!container) return;
  const lista = carregarHistorico7Dias();
  if(!lista.length){
    container.innerHTML = `<p style="padding:14px; text-align:center; color:#5b6f79; font-size:14px;">Nenhuma prova criada nos últimos 7 dias neste navegador.</p>`;
    return;
  }
  
  container.innerHTML = lista.map(it => `
    <div class="historico-card">
      <div class="historico-card-content">
        <div class="historico-card-title">${it.titulo || it.conteudo}</div>
        <div class="historico-card-meta">
          <span>🏫 ${it.turma ? it.turma.replace(" Fundamental","") : ""}</span>
          <span>📚 ${it.disciplina}</span>
          <span>📅 ${it.dataStr}</span>
        </div>
      </div>
      <button class="btn-recuperar" type="button" onclick="carregarAtividadeDoHistorico('${it.id}')">
        👁️ Ver / Baixar PDF
      </button>
    </div>
  `).join("");
}
