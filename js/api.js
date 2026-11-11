/* ============================================================
   CHAMADA À IA (GOOGLE GEMINI) COM ANEL CIRCULAR E TRATAMENTO DE ERROS
   ============================================================ */

async function chamarGemini(apiKey, corpo, aviso){
  let ultimoErro = null;
  let modelosComCotaEsgotada = 0;
  const modeloInicial = indiceModeloAtual;

  for(let passo = 0; passo < TOTAL_MODELOS; passo++){
    const idx = (modeloInicial + passo) % TOTAL_MODELOS;
    const modelo = MODELOS_RESERVA[idx];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s de limite máximo por modelo

    try{
      const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + modelo + ":generateContent?key=" + encodeURIComponent(apiKey), {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(corpo),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if(resp.ok){
        indiceModeloAtual = idx; // Salva o modelo funcional como ponto de partida das próximas requisições
        return await resp.json();
      }

      const txtErro = await resp.text();
      // Só considera erro de chave quando o Google diz explicitamente que a chave é o problema.
      // Um 403 de um modelo específico (sem acesso) não deve bloquear os demais modelos.
      const ehVazada = /leaked/i.test(txtErro);
      const ehErroChave = ehVazada || resp.status === 401 ||
        /API_KEY_INVALID|API key not valid|API key expired|API_KEY_SERVICE_BLOCKED|SERVICE_DISABLED/i.test(txtErro);
      if(ehErroChave){
        throw new Error(ehVazada
          ? "Chave inválida: o Google bloqueou esta chave por ter sido exposta publicamente. Gere uma nova chave no Google AI Studio e salve nas configurações."
          : "Chave inválida ou sem permissão para a API do Gemini. Verifique a chave inserida.");
      }

      if(resp.status === 429){
        modelosComCotaEsgotada++;
      }

      // Se for 429, 503, 500, 404, avança instantaneamente para o próximo modelo no anel
      if(passo < TOTAL_MODELOS - 1){
        const proximoIdx = (idx + 1) % TOTAL_MODELOS;
        const proxModelo = MODELOS_RESERVA[proximoIdx];
        if(aviso) aviso("Alternando automaticamente para " + proxModelo + " (Tentativa " + (passo + 2) + " de " + TOTAL_MODELOS + ")...");
        await espera(150);
        continue;
      }
      ultimoErro = new Error("Falha na IA (" + resp.status + "): " + txtErro.slice(0, 100));
    }catch(e){
      clearTimeout(timeoutId);
      if(e.message && e.message.includes("Chave inválida")) throw e;
      if(passo < TOTAL_MODELOS - 1){
        const proximoIdx = (idx + 1) % TOTAL_MODELOS;
        const proxModelo = MODELOS_RESERVA[proximoIdx];
        if(aviso) aviso("Alternando automaticamente para " + proxModelo + " (Tentativa " + (passo + 2) + " de " + TOTAL_MODELOS + ")...");
        await espera(150);
        continue;
      }
      ultimoErro = e;
    }
  }

  // Se todos os modelos retornaram 429, emite diagnóstico preciso de cota global
  if(modelosComCotaEsgotada >= TOTAL_MODELOS){
    throw new Error("Aviso de Cota: Todos os " + TOTAL_MODELOS + " modelos gratuitos do Gemini atingiram o limite diário da sua chave hoje. A cota será renovada automaticamente pelo Google em algumas horas, ou você pode cadastrar uma nova chave gratuita nas configurações.");
  }

  throw ultimoErro || new Error("Os servidores do Google estão temporariamente instáveis. Tente novamente em instantes.");
}

async function obterChave(){
  if(CHAVE_FIXA) return CHAVE_FIXA.trim();
  const local = (localStorage.getItem("gemini_key") || "").trim();
  if(local) return local;
  if(chaveCompartilhada) return chaveCompartilhada;
  await carregamentoChave;
  return (chaveCompartilhada || localStorage.getItem("gemini_key") || "").trim();
}
