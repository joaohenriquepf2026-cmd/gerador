/* ============================================================
   CATÁLOGO CURRICULAR E MATRIZES DA BNCC (4º E 5º ANOS)
   Módulo isolado para disciplinas, turmas e conteúdos oficiais
   ============================================================ */

const TURMAS = ["4º Ano Fundamental", "5º Ano Fundamental"];

const DISCIPLINAS = [
  ["Português", "📖"],
  ["Matemática", "📐"],
  ["História", "🏛️"],
  ["Geografia", "🌍"],
  ["Ciências", "🔬"],
  ["Arte", "🎨"],
  ["Inglês", "🗣️"],
  ["Educação Física", "⚽"],
  ["Formação Cidadã", "🤝"]
];

const CONTEUDOS = {
  "4º Ano Fundamental": {
    "Português": [
      "Leitura e interpretação de textos narrativos", "Gêneros textuais: conto, fábula e notícia",
      "Ortografia: uso de R/RR, S/SS, Ç e X", "Pontuação e entonação expressiva",
      "Substantivos: próprios, comuns e coletivos", "Adjetivos e concordância nominal",
      "Verbos de ação no presente, passado e futuro", "Sinônimos e antônimos no contexto textual",
      "Separação silábica e tonicidade das palavras", "Produção de parágrafos e organização de ideias"
    ],
    "Matemática": [
      "Sistema de numeração decimal até dezenas de milhar", "Adição e subtração com reagrupamento",
      "Multiplicação por números de dois algarismos", "Divisão exata e com resto",
      "Frações simples: metades, terços e quartos", "Geometria: polígonos, retas e ângulos",
      "Medidas de comprimento: metro, centímetro e milímetro", "Medidas de massa: quilograma e grama",
      "Medidas de tempo: horas, minutos e segundos no relógio", "Gráficos e tabelas: leitura e interpretação estatística"
    ],
    "História": [
      "A formação das cidades e os primeiros grupos humanos", "O nomadismo e a fixação na agricultura",
      "Rotas comerciais terrestres e fluviais antigas", "A chegada dos portugueses e os povos indígenas",
      "A vida no campo e na cidade no passado", "Patrimônio cultural material e imaterial",
      "Migrações no Brasil e a diversidade cultural", "A história dos transportes e das comunicações",
      "O trabalho e os diferentes ofícios no decorrer do tempo", "Fontes históricas: documentos, fotos e memórias orais"
    ],
    "Geografia": [
      "Paisagens naturais e paisagens transformadas", "Elementos do relevo brasileiro",
      "Bacias hidrográficas e a importância da água", "Clima, vegetação e suas influências",
      "A divisão política do Brasil: municípios e estados", "A relação campo-cidade e o fluxo de produtos",
      "Pontos cardeais, bússola e orientação espacial", "Representações cartográficas: leitura de mapas e plantas",
      "Recursos naturais e sustentabilidade ambiental", "As regiões brasileiras e suas características gerais"
    ],
    "Ciências": [
      "Cadeias e teias alimentares nos ecossistemas", "Produtores, consumidores e decompositores",
      "O ciclo da água na natureza e a precipitação", "Transformações reversíveis e irreversíveis da matéria",
      "Misturas homogêneas e heterogêneas no cotidiano", "O solo: composição, fertilidade e conservação",
      "Pontos cardeais e a trajetória aparente do Sol", "Calendários e a contagem do tempo pelos astros",
      "Micro-organismos: bactérias, fungos e vírus na saúde", "Propriedades físicas dos materiais: condutividade e densidade"
    ],
    "Arte": [
      "Cores primárias, secundárias e o círculo cromático", "Linhas, texturas e formas no desenho",
      "Pintura e técnicas com materiais da natureza", "Escultura e modelagem tridimensional com argila",
      "Arte rupestre e grafismos indígenas brasileiros", "Elementos do teatro: personagens, cenário e fala",
      "Música: ritmo, timbre e sons do ambiente", "Danças circulares e manifestações folclóricas",
      "Fotografia e registro do patrimônio visual", "Xilogravura e a arte do cordel nordestino"
    ],
    "Inglês": [
      "Greetings and introductions: cumprimentos formais e informais", "Numbers from 1 to 50: contagem e uso cotidiano",
      "Colors and simple shapes: cores e formas geométricas", "Family members: identificação da família",
      "School objects and classroom rules: objetos escolares", "Days of the week and months: dias e meses",
      "Parts of the body: partes do corpo humano", "Farm and wild animals: animais domésticos e selvagens",
      "Food and drinks: alimentos e bebidas", "Daily routines: atividades do cotidiano"
    ],
    "Educação Física": [
      "Jogos e brincadeiras populares", "Brincadeiras tradicionais brasileiras", "Esportes individuais", "Esportes coletivos",
      "Atletismo", "Ginásticas", "Danças e manifestações culturais", "Lutas e práticas corporais",
      "Coordenação motora e habilidades corporais", "Respeito, cooperação e trabalho em equipe"
    ],
    "Formação Cidadã": [
      "Cidadania e convivência social", "Direitos e deveres", "Respeito às diferenças", "Diversidade cultural", "Ética e valores",
      "Respeito e empatia", "Responsabilidade e participação", "Convivência democrática e diálogo",
      "Preservação do meio ambiente", "Bullying, respeito e cultura de paz"
    ]
  },
  "5º Ano Fundamental": {
    "Português": [
      "Interpretação e compreensão de textos", "Gêneros textuais", "Produção de textos", "Ortografia", "Acentuação gráfica",
      "Classes gramaticais", "Substantivos, adjetivos e verbos", "Pronomes e artigos",
      "Pontuação e organização das frases", "Coesão e coerência textual"
    ],
    "Matemática": [
      "Sistema de numeração decimal", "Números naturais e comparação de números", "Adição, subtração, multiplicação e divisão",
      "Expressões numéricas", "Frações", "Números decimais", "Porcentagem e situações do cotidiano",
      "Medidas de comprimento, massa, capacidade e tempo", "Geometria: figuras planas e sólidos geométricos",
      "Perímetro, área e resolução de problemas"
    ],
    "História": [
      "Formação do povo brasileiro", "Povos indígenas do Brasil", "Colonização portuguesa",
      "Escravização de africanos e resistência", "Ciclo do açúcar", "Mineração e ocupação do território",
      "Independência do Brasil", "Brasil Império", "Proclamação da República",
      "Cidadania e transformações da sociedade brasileira"
    ],
    "Geografia": [
      "O território brasileiro", "Estados e regiões do Brasil", "Município, estado e país", "Paisagens naturais e modificadas",
      "Relevo brasileiro", "Clima e vegetação", "Hidrografia e rios brasileiros", "População brasileira e migrações",
      "Espaço urbano e espaço rural", "Atividades econômicas e recursos naturais"
    ],
    "Ciências": [
      "Corpo humano e sistemas do organismo", "Alimentação e nutrientes", "Hábitos de higiene e saúde",
      "Sistema respiratório", "Sistema circulatório", "Sistema digestório", "Ciclo da água",
      "Estados físicos e transformações da matéria", "Energia e suas formas", "Meio ambiente, sustentabilidade e preservação"
    ],
    "Arte": [
      "Artes visuais", "Cores primárias, secundárias e terciárias", "Desenho e composição", "Pintura e diferentes técnicas",
      "Escultura e formas tridimensionais", "Música e elementos musicais", "Ritmo e percussão", "Dança e expressão corporal",
      "Teatro e dramatização", "Cultura popular e manifestações artísticas brasileiras"
    ],
    "Inglês": [
      "Greetings and introductions", "Numbers", "Colors", "Family members", "School objects and subjects",
      "Days of the week and months", "Parts of the body", "Animals", "Food and drinks", "Daily routines and basic sentences"
    ],
    "Educação Física": [
      "Jogos e brincadeiras populares", "Esportes coletivos", "Atletismo", "Ginástica", "Danças", "Lutas e artes marciais",
      "Coordenação motora", "Equilíbrio, agilidade e velocidade", "Regras, cooperação e respeito",
      "Saúde, corpo e qualidade de vida"
    ],
    "Formação Cidadã": [
      "Cidadania e convivência social", "Direitos e deveres", "Respeito às diferenças", "Diversidade cultural", "Ética e valores",
      "Solidariedade e cooperação", "Responsabilidade individual e coletiva", "Preservação do meio ambiente",
      "Participação social e comunidade", "Resolução de conflitos e cultura de paz"
    ]
  }
};
