/* ============================================================
   CONFIGURAÇÃO GERAL E CONSTANTES DA APLICAÇÃO
   ============================================================ */

const CHAVE_FIXA = ""; // Opcional: chave fixa local caso desejado
const SETTINGS_PASSWORD = "prof2026"; // Senha do gestor para área restrita

// Anel Circular Canônico de Modelos Operacionais do Gemini (12 Modelos)
const MODELOS_RESERVA = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-pro-latest"
];
const TOTAL_MODELOS = MODELOS_RESERVA.length;
let indiceModeloAtual = 0; // Ponteiro persistente que se move em anel circular
const espera = ms => new Promise(r => setTimeout(r, ms));

/* ============================================================
   CONFIGURAÇÃO DO FIREBASE (SINCRONIZAÇÃO DE CHAVE COMPARTILHADA)
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyD6Axo797gAJz5lsOVRHcLpFdTjoVC6l2w",
  authDomain: "gerador-a86f8.firebaseapp.com",
  databaseURL: "https://gerador-a86f8-default-rtdb.firebaseio.com",
  projectId: "gerador-a86f8",
  storageBucket: "gerador-a86f8.firebasestorage.app",
  messagingSenderId: "745675623821",
  appId: "1:745675623821:web:d92b53b76459cd2360c1c4",
  measurementId: "G-E5P8V1BLFY"
};

function iniciarFirebase(){
  const configurado = firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId;
  if(!configurado) return null;

  try{
    if(typeof firebase === "undefined") throw new Error("O SDK do Firebase não foi carregado.");
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
    return app.database();
  }catch(e){
    console.warn("Não foi possível iniciar o Firebase:", e);
    return null;
  }
}

const firebaseDatabase = iniciarFirebase();
const chaveFirebaseRef = firebaseDatabase ? firebaseDatabase.ref("config/gemini") : null;
let chaveCompartilhada = CHAVE_FIXA.trim();
let carregamentoChave = Promise.resolve(chaveCompartilhada);

function aplicarChaveCompartilhada(valor){
  chaveCompartilhada = String(valor || "").trim();
  const inp = document.getElementById("apikey");
  if(inp) inp.value = chaveCompartilhada;
  return chaveCompartilhada;
}

if(chaveFirebaseRef && !CHAVE_FIXA){
  carregamentoChave = chaveFirebaseRef.child("valor").once("value")
    .then(snapshot=>aplicarChaveCompartilhada(snapshot.val()))
    .catch(e=>{
      console.warn("Não foi possível carregar a chave compartilhada:", e);
      return aplicarChaveCompartilhada(localStorage.getItem("gemini_key"));
    });

  chaveFirebaseRef.child("valor").on("value", snapshot=>{
    aplicarChaveCompartilhada(snapshot.val());
  }, e=>console.warn("Não foi possível sincronizar a chave compartilhada:", e));
}

async function salvarNoFirebase(registro){
  if(!firebaseDatabase) return;
  try{
    await firebaseDatabase.ref("atividades").push({
      ...registro,
      criadoEmServidor: firebase.database.ServerValue.TIMESTAMP
    });
  }catch(e){
    console.warn("Não foi possível salvar no Firebase Realtime Database:", e);
  }
}

/* ============================================================
   MATRIZES CURRICULARES E CONTEXTUAIS DESACOPLADAS
   Consulte os módulos dedicados:
   - js/dados-curriculo.js (TURMAS, DISCIPLINAS, CONTEUDOS)
   - js/matriz-contextos.js (MATRIZ_CONTEXTOS, sortearContexto)
   ============================================================ */
