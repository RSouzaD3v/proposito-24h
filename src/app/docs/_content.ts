export type DocTopic = {
  id: string;
  title: string;
  summary: string;
  steps?: string[];
  note?: string;
  link?: { href: string; label: string };
};

export type DocSection = { id: string; title: string; topics: DocTopic[] };

export const READER_DOCS: DocSection[] = [
  {
    id: "comecar",
    title: "Primeiros passos",
    topics: [
      {
        id: "criar-conta",
        title: "Como criar minha conta",
        summary: "Sua conta é criada a partir do escritor que você quer acompanhar.",
        steps: [
          "Abra o link (endereço) do escritor que você quer acompanhar.",
          "Toque em “Criar minha conta”.",
          "Preencha nome, e-mail e senha e confirme.",
        ],
        note: "Sua conta fica vinculada ao escritor do link e, por enquanto, essa escolha é vitalícia.",
      },
      {
        id: "trocar-escritor",
        title: "Posso trocar de escritor?",
        summary:
          "Por enquanto, não. Depois de criar a conta, não é possível mudar de escritor nem usar o mesmo e-mail com outro.",
      },
      {
        id: "entrar",
        title: "Como entrar na minha conta",
        summary: "Use o e-mail e a senha do cadastro. Depois de entrar, você vai direto para a tela Hoje.",
        link: { href: "/login", label: "Entrar" },
      },
      {
        id: "esqueci-senha",
        title: "Esqueci minha senha",
        summary: "Você recebe por e-mail um link para criar uma senha nova.",
        steps: [
          "Na tela de login, toque em “Esqueceu a senha?”.",
          "Informe o e-mail da sua conta.",
          "Abra o link recebido e defina a nova senha.",
        ],
        link: { href: "/forgot-password", label: "Recuperar senha" },
      },
    ],
  },
  {
    id: "dia-a-dia",
    title: "No dia a dia",
    topics: [
      {
        id: "hoje",
        title: "Tela Hoje",
        summary: "Reúne o devocional, a oração, o versículo e a frase que o seu escritor preparou para o dia.",
        link: { href: "/reader/area", label: "Abrir Hoje" },
      },
      {
        id: "biblia",
        title: "Ler a Bíblia",
        summary: "No menu Bíblia, escolha o livro e o capítulo. Estão disponíveis as versões NVI e ACF.",
        link: { href: "/reader/area/bible-nvi", label: "Abrir Bíblia" },
      },
      {
        id: "caderno",
        title: "Caderno de oração",
        summary: "Guarde seus pedidos de oração e acompanhe cada um ao longo do tempo.",
        steps: [
          "Abra Caderno no menu.",
          "Crie um novo pedido e escreva pelo que você está orando.",
          "Se quiser, adicione detalhes e desde quando você ora por isso.",
        ],
        link: { href: "/reader/area/prayer-journal", label: "Abrir Caderno" },
      },
      {
        id: "livros",
        title: "Livros do escritor",
        summary: "Veja e leia os livros publicados pelo seu escritor.",
        link: { href: "/reader/area/courses", label: "Abrir livros" },
      },
      {
        id: "agrupamentos",
        title: "Séries de devocionais",
        summary: "O escritor pode organizar conteúdos em séries para você acompanhar em sequência.",
        link: { href: "/reader/area/group-daily", label: "Abrir séries" },
      },
      {
        id: "jornada",
        title: "Minha jornada",
        summary: "Acompanhe seu caminho na leitura e suas conquistas.",
        link: { href: "/reader/area/journey", label: "Abrir Jornada" },
      },
      {
        id: "jogos",
        title: "Jogos bíblicos",
        summary: "Aprenda se divertindo com o Quiz Bíblico e o Conectar Palavras.",
        link: { href: "/reader/area/games", label: "Abrir Games" },
      },
    ],
  },
  {
    id: "conta",
    title: "Conta e assinatura",
    topics: [
      {
        id: "bloqueado",
        title: "Por que um conteúdo está bloqueado?",
        summary:
          "Cada escritor define o acesso ao próprio conteúdo. Ele pode ser grátis, exclusivo para assinantes ou vendido à parte.",
        link: { href: "/reader/area/subscription", label: "Ver assinatura" },
      },
      {
        id: "alterar-senha",
        title: "Alterar minha senha",
        summary: "Se você lembra a senha atual, troque por outra em Configurações.",
        link: { href: "/reader/area/settings", label: "Abrir Configurações" },
      },
    ],
  },
];

export const WRITER_DOCS: DocSection[] = [
  {
    id: "comecar",
    title: "Primeiros passos",
    topics: [
      {
        id: "criar-plataforma",
        title: "Criar minha plataforma",
        summary: "Em um único formulário você define seu espaço e sua conta.",
        steps: [
          "Informe o nome da plataforma e confira o endereço sugerido.",
          "Preencha seu nome, e-mail e senha.",
          "Se quiser, envie a logo e escolha as cores.",
          "Toque em “Criar minha plataforma” e entre com sua conta.",
        ],
        link: { href: "/register-writer", label: "Criar plataforma" },
      },
      {
        id: "assinatura",
        title: "Assinar a plataforma",
        summary: "Escolha seu plano na tela de assinatura. O CPF ou CNPJ é obrigatório para a cobrança.",
        link: { href: "/writer/subscription", label: "Ver planos" },
      },
      {
        id: "convidar",
        title: "Convidar leitores",
        summary: "Seu painel tem o link de cadastro para enviar aos leitores.",
        steps: ["Abra o Painel.", "Copie o link de cadastro.", "Envie para seus leitores."],
        note: "Quem se cadastra pelo seu link fica vinculado à sua plataforma.",
        link: { href: "/writer/dashboard", label: "Abrir Painel" },
      },
      {
        id: "ver-como-leitor",
        title: "Ver como o leitor vê",
        summary: "No Painel, toque em “Ver como leitor” para conferir sua biblioteca antes de divulgar.",
        link: { href: "/writer/publications/my-vitrine", label: "Ver como leitor" },
      },
    ],
  },
  {
    id: "diario",
    title: "Conteúdo diário",
    topics: [
      {
        id: "publicar",
        title: "Publicar conteúdo do dia",
        summary: "Devocional, oração, versículo e citação são publicados em Diário.",
        steps: [
          "Abra Diário e escolha o tipo de conteúdo.",
          "Crie um novo item e preencha o texto.",
          "Escolha a data em que ele deve aparecer.",
          "Salve.",
        ],
        note: "Devocionais e orações também aceitam áudio. Todos os tipos aceitam imagem.",
        link: { href: "/writer/daily", label: "Abrir Diário" },
      },
      {
        id: "massa",
        title: "Postar em massa com planilha",
        summary: "Envie muitos conteúdos de uma vez com um arquivo .xls ou .xlsx.",
        steps: [
          "Abra Postagem em massa.",
          "Baixe o modelo de exemplo do tipo desejado.",
          "Preencha a planilha sem alterar as colunas.",
          "Envie o arquivo e confira a resposta na tela.",
        ],
        link: { href: "/writer/imports", label: "Abrir importação" },
      },
      {
        id: "gerenciar",
        title: "Editar ou revisar o que já publiquei",
        summary: "O Gerenciamento Diário reúne todo o conteúdo do diário em um só lugar.",
        link: { href: "/writer/daily/management", label: "Abrir gerenciamento" },
      },
      {
        id: "agrupamentos",
        title: "Criar séries de conteúdo",
        summary: "Em Diários Agrupamento você junta conteúdos em uma série, com título, descrição e imagem.",
        link: { href: "/writer/group-daily", label: "Abrir agrupamentos" },
      },
    ],
  },
  {
    id: "livros",
    title: "Livros",
    topics: [
      {
        id: "criar-livro",
        title: "Publicar um livro",
        summary: "Crie o livro em Minhas Publicações, com capa, PDF ou capítulos escritos na plataforma.",
        steps: [
          "Toque em “Novo livro”.",
          "Preencha título, tipo e status.",
          "Defina o acesso do leitor.",
          "Envie a capa e o PDF, ou escreva os capítulos.",
          "Deixe o status como publicado para aparecer aos leitores.",
        ],
        link: { href: "/writer/publications/create", label: "Novo livro" },
      },
      {
        id: "acesso",
        title: "Grátis, venda avulsa ou assinantes",
        summary: "Em “Acesso do leitor”, cada livro pode ser:",
        steps: [
          "Grátis para leitores: todos podem ler.",
          "Venda avulsa: você define o preço.",
          "Somente assinantes: exclusivo para quem assina.",
        ],
      },
    ],
  },
  {
    id: "marca",
    title: "Sua marca",
    topics: [
      {
        id: "perfil",
        title: "Logo, títulos e cores principais",
        summary: "Em Mais Recursos você ajusta os títulos do app, a logo e as cores da sua plataforma.",
        link: { href: "/writer/profile", label: "Abrir Mais Recursos" },
      },
      {
        id: "personalizacao",
        title: "Personalização completa das cores",
        summary: "Ative a personalização para definir cores de fundo, botões e textos da área do leitor.",
        link: { href: "/writer/personalization", label: "Abrir Personalização" },
      },
    ],
  },
  {
    id: "resultados",
    title: "Resultados e conta",
    topics: [
      {
        id: "insights",
        title: "Acompanhar resultados",
        summary: "Meus Insights mostra receita, novos assinantes, leitores ativos e leituras concluídas.",
        link: { href: "/writer/analytics", label: "Abrir Insights" },
      },
      {
        id: "configuracoes",
        title: "Gerenciar minha assinatura",
        summary: "Em Configurações você vê seus planos e as preferências da conta. Os pagamentos são processados pelo Asaas.",
        link: { href: "/writer/settings", label: "Abrir Configurações" },
      },
    ],
  },
];
