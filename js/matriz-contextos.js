/* ============================================================
   MATRIZ DINÂMICA DE CONTEXTOS ANTI-REPETIÇÃO
   Garante narrativas e cenários inéditos para cada atividade
   ============================================================ */

const MATRIZ_CONTEXTOS = {
  "Português": [
    "Diário de bordo de uma expedição científica na Amazônia",
    "Crônica sobre a feira de adoção de animais do bairro",
    "Notícia escolar sobre a horta comunitária e sustentabilidade",
    "Troca de cartas/e-mails entre amigos de estados diferentes (Bahia e Paraná)",
    "Fábula contemporânea com animais urbanos e cooperação",
    "Entrevista de rádio escolar com um inventor mirim de brinquedos recicláveis",
    "Conto de mistério sobre o desaparecimento de um livro antigo na biblioteca",
    "Relato de viagem de trem pela Serra da Mantiqueira"
  ],
  "Matemática": [
    "Controle de estoque e vendas da cantina escolar saudável",
    "Expedição astronômica: distâncias planetárias e pesos relativos",
    "Campeonato regional de atletismo escolar: tempos, saltos e pontuação",
    "Orçamento e planejamento para a reforma do parque da cidade",
    "Receitas culinárias regionais: proporções, massas e medidas de capacidade",
    "Painel solar e economia de energia elétrica na comunidade",
    "Medições topográficas e mapeamento de trilhas em parque ecológico",
    "Feira de artesanato e cerâmica: geometria dos vasos e padrões de azulejos"
  ],
  "História": [
    "Diário fictício de um tropeiro cruzando o Caminho dos Diamantes no séc. XVIII",
    "Memórias de uma tecelã na chegada das primeiras indústrias ao Brasil",
    "Escavações arqueológicas no Parque Nacional da Serra da Capivara",
    "Histórias contadas por anciãos sobre a fundação do bairro e antigos ofícios",
    "A rota das especiarias e os relatos dos navegantes em cartas náuticas",
    "Movimentos de resistência e quilombos nos sertões nordestinos",
    "A evolução dos meios de comunicação: do telégrafo aos satélites no Brasil"
  ],
  "Geografia": [
    "Bacia hidrográfica do Rio São Francisco e as comunidades ribeirinhas",
    "Comparativo climático e de vegetação entre a Caatinga e os Pampas",
    "O trajeto das mercadorias dos portos brasileiros até os centros urbanos",
    "Expansão urbana sustentável e cinturões verdes em metrópoles",
    "Uso do solo, agricultura familiar e tecnologia no Centro-Oeste",
    "Estudo das coordenadas e relevo na Chapada Diamantina"
  ],
  "Ciências": [
    "Ecossistema dos recifes de coral no litoral de Abrolhos",
    "O ciclo da matéria orgânica e a composteira da escola",
    "Adaptações de plantas e animais para sobreviver ao semiárido",
    "A física das brincadeiras: forças no balanço, escorregador e skate",
    "Ciclo hidrológico e a formação das chuvas orográficas nas serras",
    "Microrganismos fermentadores na fabricação de pães e queijos artesanais"
  ],
  "Arte": [
    "Mosaicos bizantinos e geometria na arte mourisca",
    "A xilogravura na literatura de cordel nordestina",
    "O modernismo e o uso das cores na obra de Tarsila do Amaral",
    "Cores complementares e sombras na pintura impressionista ao ar livre",
    "Arte plumária e grafismos corporais dos povos originários",
    "Esculturas cinéticas e arte em movimento"
  ],
  "Inglês": [
    "Planning a healthy international picnic with friends from around the world",
    "A day at the wildlife conservation zoo: daily routines and animal habits",
    "Lost luggage at the eco-airport: describing objects, colors and clothes",
    "Weather report from different cities around the globe: seasons and forecasts",
    "A science fair presentation: simple steps, tools and experiments"
  ],
  "Educação Física": [
    "Jogos e brincadeiras indígenas (Petychebó, Peteca e Corrida de Toras)",
    "Fisiologia prática: monitorando os batimentos cardíacos antes e após corridas",
    "Estratégia e cooperação em esportes coletivos sem contato físico",
    "Circuitos de agilidade e equilíbrio postural na ginástica escolar"
  ],
  "Formação Cidadã": [
    "Assembleia estudantil e o orçamento participativo do grêmio escolar",
    "Consumo consciente, direito do consumidor e descarte de lixo eletrônico",
    "Acessibilidade urbana e inclusão de pessoas com deficiência na cidade",
    "Mediação pacífica de conflitos no recreio e respeito às diferenças de opinião"
  ]
};

function sortearContexto(disciplina){
  const lista = MATRIZ_CONTEXTOS[disciplina] || MATRIZ_CONTEXTOS["Matemática"];
  return lista[Math.floor(Math.random() * lista.length)];
}
