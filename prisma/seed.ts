import { PrismaClient, ArticleType, ArticleStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// ⚠️  SENHA TEMPORÁRIA — troque imediatamente após o primeiro login
const SEED_ADMIN_EMAIL = 'admin@turbocloud.com.br'
const SEED_ADMIN_PASSWORD = 'TurboAdmin@2026'

async function main() {
  // ─── Categorias ────────────────────────────────────────────────────────────

  const categories = [
    {
      name: 'Primeiros Passos',
      slug: 'primeiros-passos',
      description: 'Tudo que você precisa saber para começar com a TurboCloud.',
      icon: '🚀',
      order: 1,
      active: true,
    },
    {
      name: 'WordPress',
      slug: 'wordpress',
      description: 'Instalação, configuração e otimização do WordPress.',
      icon: '📝',
      order: 2,
      active: true,
    },
    {
      name: 'Domínios e DNS',
      slug: 'dominios-dns',
      description: 'Registro, transferência e configuração de domínios e DNS.',
      icon: '🌐',
      order: 3,
      active: true,
    },
    {
      name: 'E-mail',
      slug: 'email',
      description: 'Criação e configuração de contas de e-mail profissional.',
      icon: '✉️',
      order: 4,
      active: true,
    },
    {
      name: 'VPS e Projetos',
      slug: 'vps',
      description: 'Gerenciamento de servidores VPS e projetos de hospedagem.',
      icon: '🖥️',
      order: 5,
      active: true,
    },
    {
      name: 'Segurança e Backup',
      slug: 'seguranca-backup',
      description: 'Proteção do seu site e recuperação de dados.',
      icon: '🔒',
      order: 6,
      active: true,
    },
    {
      name: 'Faturamento',
      slug: 'faturamento',
      description: 'Planos, pagamentos, notas fiscais e cancelamentos.',
      icon: '💳',
      order: 7,
      active: true,
    },
    {
      name: 'Afiliados',
      slug: 'afiliados',
      description: 'Como funciona o programa de afiliados da TurboCloud.',
      icon: '🤝',
      order: 8,
      active: true,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log('✅ 8 categorias criadas/atualizadas.')

  // ─── Usuário SUPER_ADMIN inicial ───────────────────────────────────────────

  // Senha hasheada com bcrypt, 12 rounds — valor temporário para primeiro acesso
  const hashedPassword = await hash(SEED_ADMIN_PASSWORD, 12)

  await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: {},                          // Não sobrescreve se já existir
    create: {
      email: SEED_ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  console.log('✅ Usuário SUPER_ADMIN criado.')
  console.log('')
  console.log('┌─────────────────────────────────────────────────────┐')
  console.log('│  CREDENCIAIS INICIAIS DO PAINEL ADMIN               │')
  console.log('│                                                       │')
  console.log(`│  E-mail : ${SEED_ADMIN_EMAIL.padEnd(42)}│`)
  console.log(`│  Senha  : ${SEED_ADMIN_PASSWORD.padEnd(42)}│`)
  console.log('│                                                       │')
  console.log('│  ⚠️  TROQUE A SENHA IMEDIATAMENTE APÓS O PRIMEIRO    │')
  console.log('│     LOGIN EM /admin/usuarios                         │')
  console.log('└─────────────────────────────────────────────────────┘')

  // ─── Conteúdos de exemplo (artigos) ────────────────────────────────────────
  await seedArticles()
}

interface SupportBlockSeed {
  title: string
  badge?: string
  content: string
}

interface ArticleSeed {
  title: string
  slug: string
  type: ArticleType
  categorySlug: string
  excerpt: string
  metaTitle: string
  metaDesc: string
  content: string
  videoUrl?: string
  supportBlocks?: SupportBlockSeed[]
  featured?: boolean
  status?: ArticleStatus
}

const TEXT_ARTICLES: ArticleSeed[] = [
  {
    title: 'Como criar sua primeira conta na TurboCloud',
    slug: 'como-criar-sua-primeira-conta-turbocloud',
    type: 'TEXT',
    categorySlug: 'primeiros-passos',
    excerpt: 'Passo a passo para criar sua conta, confirmar e-mail e fazer o primeiro login no painel.',
    metaTitle: 'Criar conta na TurboCloud — Guia inicial',
    metaDesc: 'Aprenda a criar sua conta na TurboCloud em menos de 3 minutos: cadastro, confirmação e primeiro acesso.',
    featured: true,
    content: `<h2>Antes de começar</h2><p>Tenha em mãos um e-mail válido e um celular para confirmação em duas etapas. Você poderá completar todo o processo em menos de 3 minutos.</p><h2>1. Acesse a página de cadastro</h2><p>Vá até <a href="https://turbocloud.com.br">turbocloud.com.br</a> e clique em <strong>Criar conta</strong> no canto superior direito.</p><h2>2. Preencha seus dados</h2><ul><li>Nome completo (igual ao documento)</li><li>E-mail principal — será seu login</li><li>Senha forte (mínimo 12 caracteres, com número e símbolo)</li></ul><h2>3. Confirme o e-mail</h2><p>Você receberá um link de ativação. Clique nele em até 24 horas para validar o cadastro.</p><h2>4. Primeiro login</h2><p>Use o e-mail e senha cadastrados. Na primeira entrada, configure a autenticação em duas etapas — isso é fortemente recomendado.</p>`,
  },
  {
    title: 'Guia completo de instalação do WordPress',
    slug: 'guia-instalacao-wordpress',
    type: 'TEXT',
    categorySlug: 'wordpress',
    excerpt: 'Instale o WordPress em sua hospedagem TurboCloud com instalador automático ou método manual.',
    metaTitle: 'Como instalar o WordPress na TurboCloud',
    metaDesc: 'Dois caminhos para instalar o WordPress: pelo instalador automático do painel ou manualmente via FTP.',
    content: `<h2>Método 1 — Instalador automático (recomendado)</h2><p>No painel, acesse <strong>Sites &gt; Novo Site &gt; WordPress</strong>. Em menos de 60 segundos seu site estará no ar.</p><ol><li>Escolha o domínio</li><li>Defina usuário e senha do admin</li><li>Selecione o idioma (pt-BR)</li><li>Clique em <strong>Instalar</strong></li></ol><h2>Método 2 — Instalação manual</h2><p>Útil quando você precisa de uma versão específica do core ou um perfil de configuração avançado.</p><ul><li>Baixe o WordPress em <a href="https://br.wordpress.org">br.wordpress.org</a></li><li>Envie por FTP/SFTP para a pasta <code>public_html</code></li><li>Crie um banco MySQL no painel</li><li>Acesse seu domínio e siga o wizard</li></ul><h2>Próximos passos</h2><p>Após a instalação, ative HTTPS, configure cache de página e instale um plugin de backup.</p>`,
  },
  {
    title: 'Configurando DNS no Cloudflare apontando para a TurboCloud',
    slug: 'dns-cloudflare-turbocloud',
    type: 'TEXT',
    categorySlug: 'dominios-dns',
    excerpt: 'Use o Cloudflare como provedor de DNS apontando para os IPs da TurboCloud sem perder o CDN.',
    metaTitle: 'DNS no Cloudflare para TurboCloud',
    metaDesc: 'Aponte seu domínio do Cloudflare para a TurboCloud mantendo proxy laranja e SSL automático.',
    content: `<h2>O que você vai precisar</h2><ul><li>Conta gratuita no Cloudflare</li><li>Endereço IP do servidor TurboCloud (encontrado em <em>Sites &gt; Detalhes</em>)</li><li>Acesso ao painel onde o domínio está registrado</li></ul><h2>Passo 1 — Adicione o site no Cloudflare</h2><p>Insira o domínio raiz (sem <code>www.</code>) e selecione o plano gratuito.</p><h2>Passo 2 — Crie os registros A e CNAME</h2><ul><li><strong>A</strong>  @  →  IP do servidor TurboCloud</li><li><strong>CNAME</strong>  www  →  seu-dominio.com</li></ul><h2>Passo 3 — Troque os nameservers</h2><p>No registrador do domínio, substitua os NS atuais pelos dois informados pelo Cloudflare. A propagação leva de 1 a 24 horas.</p>`,
  },
  {
    title: 'Configurar e-mail profissional no Outlook',
    slug: 'configurar-email-outlook',
    type: 'TEXT',
    categorySlug: 'email',
    excerpt: 'Adicione sua conta de e-mail TurboCloud no Outlook (desktop) com IMAP e portas seguras.',
    metaTitle: 'E-mail profissional no Outlook — TurboCloud',
    metaDesc: 'Configuração passo a passo do Outlook com IMAP, SMTP e SSL/TLS para e-mails da TurboCloud.',
    content: `<h2>Dados de configuração</h2><ul><li><strong>IMAP</strong>: mail.seudominio.com.br — porta 993 (SSL)</li><li><strong>SMTP</strong>: mail.seudominio.com.br — porta 465 (SSL)</li><li><strong>Usuário</strong>: e-mail completo (ex.: contato@seudominio.com.br)</li><li><strong>Senha</strong>: a mesma criada no painel</li></ul><h2>Adicionando no Outlook</h2><ol><li>Abra <strong>Arquivo &gt; Adicionar Conta</strong></li><li>Escolha <em>Configuração manual</em></li><li>Selecione IMAP</li><li>Preencha os dados acima</li></ol><p>Teste enviando e recebendo uma mensagem de validação.</p>`,
  },
  {
    title: 'Conectando-se via SSH ao seu VPS',
    slug: 'conexao-ssh-vps',
    type: 'TEXT',
    categorySlug: 'vps',
    excerpt: 'Use SSH com chave pública para acessar o VPS de forma segura, sem senha.',
    metaTitle: 'SSH no VPS TurboCloud — Guia prático',
    metaDesc: 'Aprenda a gerar chave SSH, cadastrá-la no painel e fazer login no VPS sem senha.',
    content: `<h2>1. Gere uma chave SSH</h2><pre><code>ssh-keygen -t ed25519 -C "seu-email@dominio.com"</code></pre><p>Aceite o caminho padrão e defina uma passphrase forte.</p><h2>2. Cadastre a chave pública no painel</h2><p>Copie o conteúdo de <code>~/.ssh/id_ed25519.pub</code> e cole em <strong>VPS &gt; Chaves SSH &gt; Nova chave</strong>.</p><h2>3. Conecte</h2><pre><code>ssh root@SEU_IP_DO_VPS</code></pre><p>Pronto — você está dentro. Para mais segurança, desative login por senha em <code>/etc/ssh/sshd_config</code>.</p>`,
  },
  {
    title: 'Ativando backups automáticos diários',
    slug: 'backups-automaticos-diarios',
    type: 'TEXT',
    categorySlug: 'seguranca-backup',
    excerpt: 'Configure backups automáticos com retenção e teste de restauração mensal.',
    metaTitle: 'Backups automáticos TurboCloud',
    metaDesc: 'Ative o backup diário, ajuste a retenção e valide a restauração para não ser pego de surpresa.',
    content: `<h2>Onde ativar</h2><p>Acesse <strong>Sites &gt; [seu site] &gt; Backups</strong> e marque <em>Backup diário automático</em>.</p><h2>Política recomendada</h2><ul><li>Retenção: 14 dias para sites em produção</li><li>Snapshot mensal mantido por 90 dias</li><li>Restauração de teste a cada 30 dias</li></ul><h2>Backup off-site</h2><p>Para sites críticos, configure também envio para um bucket externo (S3, Backblaze ou Google Cloud Storage). Assim você sobrevive até a um incidente catastrófico do provedor.</p>`,
  },
  {
    title: 'Emitir nota fiscal e segunda via de boleto',
    slug: 'nota-fiscal-segunda-via-boleto',
    type: 'TEXT',
    categorySlug: 'faturamento',
    excerpt: 'Baixe NF-e, gere segunda via de boleto e altere a forma de pagamento direto no painel.',
    metaTitle: 'NF-e e segunda via de boleto na TurboCloud',
    metaDesc: 'Tudo o que você precisa para resolver questões de faturamento sem abrir chamado.',
    content: `<h2>Notas fiscais</h2><p>Em <strong>Financeiro &gt; Notas Fiscais</strong>, todas as NF-e dos últimos 24 meses ficam disponíveis em PDF e XML. Para empresas, atualize o CNPJ e IE no perfil antes do próximo ciclo.</p><h2>Segunda via de boleto</h2><p>Em <strong>Financeiro &gt; Faturas</strong>, clique em uma fatura em aberto e selecione <em>Reimprimir boleto</em>. Boletos vencidos podem ser atualizados pelo botão <em>Atualizar vencimento</em>.</p><h2>Trocar forma de pagamento</h2><p>Você pode migrar para cartão de crédito ou Pix recorrente em <strong>Financeiro &gt; Forma de pagamento</strong>. A mudança vale a partir do próximo ciclo.</p>`,
  },
  {
    title: 'Programa de afiliados TurboCloud: como começar',
    slug: 'programa-afiliados-como-comecar',
    type: 'TEXT',
    categorySlug: 'afiliados',
    excerpt: 'Ative seu link de afiliado, divulgue e acompanhe comissões em tempo real.',
    metaTitle: 'Como ser afiliado TurboCloud',
    metaDesc: 'Participe do programa de afiliados, divulgue seu link único e acompanhe vendas e comissões.',
    content: `<h2>1. Ative seu perfil de afiliado</h2><p>No painel, vá em <strong>Afiliados &gt; Ativar conta</strong>. Aceite os termos e informe seus dados bancários.</p><h2>2. Seu link único</h2><p>Você receberá um link no formato <code>turbocloud.com.br/?ref=SEUCODIGO</code>. Toda venda originada dele é creditada para você.</p><h2>3. Comissões</h2><ul><li>30% recorrente nos primeiros 12 meses de cada cliente</li><li>Pagamento mensal a partir de R$ 50 acumulados</li><li>Saque via Pix, TED ou conta TurboCloud</li></ul>`,
  },
  {
    title: 'Migrando seu WordPress para a TurboCloud',
    slug: 'migrando-wordpress-para-turbocloud',
    type: 'TEXT',
    categorySlug: 'wordpress',
    excerpt: 'Migração gratuita assistida ou DIY com plugin All-in-One WP Migration.',
    metaTitle: 'Migrar WordPress para TurboCloud',
    metaDesc: 'Dois caminhos: peça migração gratuita pela equipe ou faça você mesmo em 4 passos.',
    content: `<h2>Opção A — Migração gratuita assistida</h2><p>Abra um chamado em <strong>Suporte &gt; Solicitar migração</strong>. Nosso time faz o trabalho em até 24h úteis sem downtime perceptível.</p><h2>Opção B — DIY com All-in-One WP Migration</h2><ol><li>No site origem, instale o plugin e clique em <em>Exportar &gt; Arquivo</em></li><li>Crie um WordPress vazio na TurboCloud</li><li>Instale o mesmo plugin no destino e use <em>Importar</em></li><li>Atualize permalinks em <em>Configurações &gt; Links permanentes</em></li></ol><h2>Após a migração</h2><p>Faça a troca de DNS quando estiver tudo testado. Mantenha o site antigo no ar por 72h para garantir cache propagado.</p>`,
  },
  {
    title: 'Glossário de termos de hospedagem',
    slug: 'glossario-termos-hospedagem',
    type: 'TEXT',
    categorySlug: 'primeiros-passos',
    excerpt: 'Os termos mais comuns do mundo de hospedagem explicados em uma frase cada.',
    metaTitle: 'Glossário de hospedagem — TurboCloud',
    metaDesc: 'DNS, SSL, cPanel, CDN, IMAP, WHM... entenda os termos sem precisar virar um técnico.',
    content: `<h2>Conceitos básicos</h2><ul><li><strong>DNS</strong>: a lista telefônica da internet — traduz o nome do site no endereço IP do servidor.</li><li><strong>SSL/TLS</strong>: o cadeado verde. Criptografa a comunicação entre navegador e servidor.</li><li><strong>CDN</strong>: rede global que serve seu site a partir do nó mais próximo do visitante.</li></ul><h2>E-mail</h2><ul><li><strong>IMAP</strong>: protocolo que mantém suas mensagens no servidor (recomendado).</li><li><strong>SMTP</strong>: protocolo de envio de e-mail.</li><li><strong>SPF, DKIM, DMARC</strong>: registros DNS que provam que seu e-mail é legítimo.</li></ul><h2>Infraestrutura</h2><ul><li><strong>VPS</strong>: servidor virtual com recursos dedicados.</li><li><strong>Hospedagem compartilhada</strong>: vários sites no mesmo servidor.</li><li><strong>RAM/CPU</strong>: o "cérebro" do servidor — quanto mais, mais visitas simultâneas você atende.</li></ul>`,
  },
]

const SUPPORT_ARTICLES: ArticleSeed[] = [
  {
    title: 'Site fora do ar — checklist de diagnóstico',
    slug: 'site-fora-do-ar-checklist',
    type: 'SUPPORT',
    categorySlug: 'vps',
    excerpt: 'Diagnóstico rápido em 6 passos para identificar onde está o problema.',
    metaTitle: 'Site fora do ar — diagnóstico',
    metaDesc: 'Checklist objetivo para identificar se o problema é DNS, servidor, aplicação ou rede do visitante.',
    featured: true,
    content: '<p>Use este checklist em ordem. A maioria dos casos é resolvida nos 3 primeiros passos.</p>',
    supportBlocks: [
      { title: 'O site abre em outra rede?', badge: 'Passo 1', content: '<p>Teste pelo 4G do celular. Se abrir lá mas não no Wi-Fi, o problema é cache do seu DNS local ou rede do provedor.</p>' },
      { title: 'O DNS está respondendo?', badge: 'Passo 2', content: '<p>Use <code>nslookup seudominio.com</code> ou <a href="https://dnschecker.org">dnschecker.org</a>. Se não responder ou apontar IP errado, ajuste os registros.</p>' },
      { title: 'O servidor responde no ping?', badge: 'Passo 3', content: '<p>Rode <code>ping IP_DO_SERVIDOR</code>. Sem resposta = servidor caído ou bloqueio de firewall.</p>' },
      { title: 'A aplicação está rodando?', badge: 'Passo 4', content: '<p>SSH no VPS e verifique <code>systemctl status nginx</code> e o serviço da aplicação.</p>' },
      { title: 'Sem solução?', badge: 'Passo 5', content: '<p>Abra chamado em <strong>Suporte &gt; Site offline</strong> com prints e horário exato do problema.</p>' },
    ],
  },
  {
    title: 'E-mail não envia ou cai em spam — passos de correção',
    slug: 'email-nao-envia-cai-spam',
    type: 'SUPPORT',
    categorySlug: 'email',
    excerpt: 'Configure SPF, DKIM e DMARC e remova seu IP de blacklists.',
    metaTitle: 'E-mail caindo em spam — TurboCloud',
    metaDesc: 'Corrija envio e entregabilidade configurando os registros corretos e checando reputação do domínio.',
    content: '<p>A entregabilidade depende de 3 fatores: autenticação, conteúdo e reputação. Comece pelos blocos abaixo.</p>',
    supportBlocks: [
      { title: 'Verifique SPF', badge: 'Autenticação', content: '<p>Em DNS, deve existir um TXT: <code>v=spf1 include:spf.turbocloud.com.br ~all</code></p>' },
      { title: 'Ative DKIM', badge: 'Autenticação', content: '<p>No painel: <strong>E-mail &gt; DKIM &gt; Ativar</strong>. A TurboCloud cria o registro automaticamente.</p>' },
      { title: 'Adicione DMARC', badge: 'Autenticação', content: '<p>Comece com política branda: <code>v=DMARC1; p=none; rua=mailto:dmarc@seudominio.com.br</code></p>' },
      { title: 'Cheque blacklists', badge: 'Reputação', content: '<p>Use <a href="https://mxtoolbox.com/blacklists.aspx">MXToolbox</a>. Se aparecer em alguma RBL, peça remoção pelo formulário do provedor da lista.</p>' },
      { title: 'Revise o conteúdo', badge: 'Conteúdo', content: '<p>Evite assuntos em CAIXA ALTA, excesso de links e palavras como "grátis", "ganhe", "urgente".</p>' },
    ],
  },
  {
    title: 'DNS não propaga após mudança — o que fazer',
    slug: 'dns-nao-propaga-apos-mudanca',
    type: 'SUPPORT',
    categorySlug: 'dominios-dns',
    excerpt: 'Confira TTL, registros e cache local antes de concluir que algo está errado.',
    metaTitle: 'DNS não propaga — solução',
    metaDesc: 'Como diferenciar propagação lenta de configuração errada e o que fazer em cada caso.',
    content: '<p>Mudanças de DNS podem levar de minutos a 48 horas. Antes de abrir chamado, valide o que segue.</p>',
    supportBlocks: [
      { title: 'Confirme o TTL anterior', badge: 'Contexto', content: '<p>Se o TTL antigo era 86400 (24h), provedores podem demorar 1 dia para soltar o valor.</p>' },
      { title: 'Use checagem global', badge: 'Diagnóstico', content: '<p>Em <a href="https://dnschecker.org">dnschecker.org</a> veja se já propagou em outros países — se sim, é cache local.</p>' },
      { title: 'Limpe o cache local', badge: 'Local', content: '<p>Windows: <code>ipconfig /flushdns</code>. macOS: <code>sudo dscacheutil -flushcache</code>.</p>' },
      { title: 'Verifique os nameservers', badge: 'Configuração', content: '<p>No registrador, confirme que os NS apontam para o provedor onde você configurou os registros.</p>' },
    ],
  },
  {
    title: 'Erro 500 no WordPress — diagnóstico',
    slug: 'erro-500-wordpress-diagnostico',
    type: 'SUPPORT',
    categorySlug: 'wordpress',
    excerpt: 'Identifique se o erro 500 é causado por plugin, tema, PHP ou .htaccess.',
    metaTitle: 'Erro 500 WordPress — como resolver',
    metaDesc: 'Roteiro de eliminação para isolar a causa de um erro 500 (HTTP Internal Server Error).',
    content: '<p>Erro 500 quase sempre é causa interna. Vamos isolar passo a passo.</p>',
    supportBlocks: [
      { title: 'Ative WP_DEBUG', badge: 'Diagnóstico', content: '<p>No <code>wp-config.php</code> defina <code>WP_DEBUG = true</code> e <code>WP_DEBUG_LOG = true</code>. O erro real aparecerá em <code>wp-content/debug.log</code>.</p>' },
      { title: 'Desative todos os plugins', badge: 'Plugins', content: '<p>Renomeie a pasta <code>wp-content/plugins</code> para <code>plugins_off</code>. Se voltar, reative um a um para achar o culpado.</p>' },
      { title: 'Troque para tema padrão', badge: 'Tema', content: '<p>Renomeie a pasta do tema ativo — o WP cai automaticamente em um Twenty.</p>' },
      { title: 'Regenere o .htaccess', badge: '.htaccess', content: '<p>Renomeie para <code>.htaccess-bkp</code> e acesse <em>Configurações &gt; Links permanentes &gt; Salvar</em> para gerar um novo.</p>' },
      { title: 'Verifique a versão do PHP', badge: 'PHP', content: '<p>No painel, use PHP 8.1+ — versões antigas não suportam mais plugins modernos.</p>' },
    ],
  },
  {
    title: 'Esqueci minha senha do painel',
    slug: 'esqueci-senha-painel',
    type: 'SUPPORT',
    categorySlug: 'primeiros-passos',
    excerpt: 'Recupere o acesso ao painel em até 5 minutos pelo e-mail cadastrado.',
    metaTitle: 'Recuperar senha — TurboCloud',
    metaDesc: 'Passo a passo para redefinir a senha do painel quando você esqueceu ou perdeu o acesso.',
    content: '<p>Tem dois caminhos: o fluxo de recuperação automática e, em último caso, abertura de chamado.</p>',
    supportBlocks: [
      { title: 'Use o link "Esqueci minha senha"', badge: 'Fluxo padrão', content: '<p>Na tela de login, clique no link e informe o e-mail cadastrado. Você receberá um link válido por 30 minutos.</p>' },
      { title: 'Não recebi o e-mail', badge: 'Checagem', content: '<p>Confira a caixa de spam e verifique se seu provedor não bloqueia mensagens de <code>nao-responda@turbocloud.com.br</code>.</p>' },
      { title: 'Perdi acesso ao e-mail', badge: 'Caso especial', content: '<p>Envie comprovante de pagamento + foto do documento para <em>suporte@turbocloud.com.br</em>. Validação em até 1 dia útil.</p>' },
    ],
  },
  {
    title: 'Pagamento recusado: causas e soluções',
    slug: 'pagamento-recusado-causas',
    type: 'SUPPORT',
    categorySlug: 'faturamento',
    excerpt: 'Cartão recusado, Pix não confirmado ou boleto vencido? Resolva sem abrir chamado.',
    metaTitle: 'Pagamento recusado — TurboCloud',
    metaDesc: 'Causas mais comuns de pagamentos recusados e como contornar para não suspender o serviço.',
    content: '<p>Pagamentos podem falhar por dezenas de razões. Confira as mais comuns abaixo.</p>',
    supportBlocks: [
      { title: 'Cartão de crédito recusado', badge: 'Cartão', content: '<p>Confira limite disponível, validade e bandeira aceita (Visa, Master, Elo, Amex). Se persistir, ligue na operadora — pode ser bloqueio antifraude.</p>' },
      { title: 'Pix não confirmado', badge: 'Pix', content: '<p>Confirmação automática leva até 30 minutos. Se passou disso, envie o comprovante em <strong>Financeiro &gt; Anexar comprovante</strong>.</p>' },
      { title: 'Boleto vencido', badge: 'Boleto', content: '<p>Boletos vencidos perdem validade. Use o botão <em>Gerar nova segunda via</em>; o novo já vem com data atualizada.</p>' },
      { title: 'Conta suspensa', badge: 'Recuperação', content: '<p>Após 5 dias de inadimplência, o site é suspenso. Quite a fatura e use <strong>Reativar serviço</strong> — religamento em até 1 hora.</p>' },
    ],
  },
  {
    title: 'Restaurar backup após invasão',
    slug: 'restaurar-backup-apos-invasao',
    type: 'SUPPORT',
    categorySlug: 'seguranca-backup',
    excerpt: 'Site invadido? Restaure um backup limpo e blinde antes de voltar ao ar.',
    metaTitle: 'Restaurar após invasão — TurboCloud',
    metaDesc: 'Restaurar um backup limpo é só metade do trabalho — você precisa fechar o vetor de entrada também.',
    content: '<p>Restaurar antes de blindar é restaurar pra reinfectar. Siga a ordem.</p>',
    supportBlocks: [
      { title: 'Coloque o site em manutenção', badge: 'Passo 1', content: '<p>No painel: <strong>Sites &gt; Modo manutenção</strong>. Isso impede que visitantes peguem malware.</p>' },
      { title: 'Identifique o vetor', badge: 'Passo 2', content: '<p>Verifique logs de acesso (Análise &gt; Logs) e busque por uploads recentes em <code>wp-content/uploads</code>.</p>' },
      { title: 'Restaure um backup pré-infecção', badge: 'Passo 3', content: '<p>Escolha um backup com data anterior aos sinais de invasão. Em caso de dúvida, vá uma semana antes.</p>' },
      { title: 'Force troca de senhas', badge: 'Passo 4', content: '<p>Painel, FTP/SFTP, banco, WordPress, e-mails. Todas. Use senhas únicas e habilite 2FA.</p>' },
      { title: 'Habilite o WAF', badge: 'Blindagem', content: '<p>Em <strong>Segurança &gt; WAF</strong> ative o modo <em>Bloqueio agressivo</em> por 7 dias após o incidente.</p>' },
    ],
  },
  {
    title: 'VPS lento ou travando — checklist',
    slug: 'vps-lento-travando-checklist',
    type: 'SUPPORT',
    categorySlug: 'vps',
    excerpt: 'Encontre o gargalo — CPU, RAM, disco ou rede — antes de fazer upgrade do plano.',
    metaTitle: 'VPS lento — diagnóstico',
    metaDesc: 'Checklist para descobrir se o problema é configuração, recurso insuficiente ou tráfego anormal.',
    content: '<p>Antes de subir de plano, descubra o que está consumindo. Em 80% dos casos é configuração.</p>',
    supportBlocks: [
      { title: 'Veja consumo em tempo real', badge: 'Diagnóstico', content: '<p>SSH no VPS e rode <code>htop</code>. Procure processos com uso alto persistente.</p>' },
      { title: 'Confira I/O de disco', badge: 'Disco', content: '<p><code>iotop</code> ou <code>iostat -x 1</code>. Disco saturado é o gargalo mais subestimado.</p>' },
      { title: 'Analise logs do servidor web', badge: 'Tráfego', content: '<p>Picos súbitos de acesso ou bots agressivos? Ative rate limiting no nginx ou Cloudflare.</p>' },
      { title: 'Tunning de banco', badge: 'MySQL/Postgres', content: '<p>Queries lentas: ative o <em>slow query log</em> e procure as 10 piores. Quase sempre falta índice.</p>' },
    ],
  },
  {
    title: 'Comissão de afiliado não creditada',
    slug: 'comissao-afiliado-nao-creditada',
    type: 'SUPPORT',
    categorySlug: 'afiliados',
    excerpt: 'Entenda as regras de atribuição e o que fazer quando uma venda não aparece no painel.',
    metaTitle: 'Comissão de afiliado não creditada',
    metaDesc: 'Regras de atribuição, prazos de validação e o que fazer quando uma venda some do painel.',
    content: '<p>Antes de abrir chamado, valide os pontos abaixo. A maioria dos "sumiços" tem explicação técnica.</p>',
    supportBlocks: [
      { title: 'A janela de atribuição é de 60 dias', badge: 'Regras', content: '<p>O clique do cliente precisa ter sido nos últimos 60 dias. Cookies bloqueados quebram o rastreio.</p>' },
      { title: 'Vendas pendentes vs. aprovadas', badge: 'Status', content: '<p>Vendas só viram comissão após 30 dias (janela de cancelamento). Antes disso, ficam como <em>Pendente</em>.</p>' },
      { title: 'Cliente usou cupom de outra origem', badge: 'Exclusão', content: '<p>Cupons promocionais geralmente sobrescrevem o cookie de afiliado.</p>' },
      { title: 'Abrir contestação', badge: 'Recurso', content: '<p>Se mesmo assim acredita que a venda foi sua, envie em <strong>Afiliados &gt; Contestar venda</strong> com data, e-mail do cliente e link clicado.</p>' },
    ],
  },
  {
    title: 'Migração de domínio travada — desbloqueio',
    slug: 'migracao-dominio-travada',
    type: 'SUPPORT',
    categorySlug: 'dominios-dns',
    excerpt: 'EPP code, lock e contato administrativo — os 3 pontos que travam a maioria das migrações.',
    metaTitle: 'Migração de domínio travada',
    metaDesc: 'O que destravar quando a migração não avança: código de autorização, lock e e-mail de aprovação.',
    content: '<p>Migrações travam quase sempre por uma destas 3 razões. Verifique na ordem.</p>',
    supportBlocks: [
      { title: 'Confirme o EPP code', badge: 'Autorização', content: '<p>O registrador antigo precisa fornecer o código (também chamado AuthInfo). Sem ele, a transferência não inicia.</p>' },
      { title: 'Desative o domain lock', badge: 'Trava', content: '<p>No painel do registrador antigo, desabilite o <em>Transfer Lock</em>. Sem isso, qualquer pedido é rejeitado.</p>' },
      { title: 'Aprove o e-mail de transferência', badge: 'Aprovação', content: '<p>O contato administrativo (e-mail no WHOIS) recebe um link de aprovação válido por 5 dias.</p>' },
      { title: 'Domínio com menos de 60 dias', badge: 'Restrição', content: '<p>Registros novos têm bloqueio de 60 dias por regra ICANN. Não há como pular essa janela.</p>' },
    ],
  },
]

const VIDEO_ARTICLES: ArticleSeed[] = [
  {
    title: 'Tour pelo painel TurboCloud em 5 minutos',
    slug: 'video-tour-painel-turbocloud',
    type: 'VIDEO',
    categorySlug: 'primeiros-passos',
    excerpt: 'Conheça as áreas principais do painel: sites, e-mails, financeiro e suporte.',
    metaTitle: 'Vídeo: tour pelo painel TurboCloud',
    metaDesc: 'Visão geral em vídeo das funcionalidades do painel TurboCloud em apenas 5 minutos.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    featured: true,
    content: '<p>Neste vídeo, fazemos uma volta completa pelo painel: dashboard, criação de sites, contas de e-mail, faturas, suporte e configurações de conta. É o ponto de partida ideal antes de começar a usar a plataforma.</p>',
  },
  {
    title: 'Instalação do WordPress em vídeo (passo a passo)',
    slug: 'video-instalacao-wordpress',
    type: 'VIDEO',
    categorySlug: 'wordpress',
    excerpt: 'Veja o instalador automático em ação criando um WordPress do zero.',
    metaTitle: 'Vídeo: instalar WordPress na TurboCloud',
    metaDesc: 'Acompanhe na tela cada etapa da instalação automática do WordPress no painel TurboCloud.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: '<p>Acompanhe na tela cada clique. Demonstramos a escolha de domínio, definição do usuário admin, instalação de tema básico e os primeiros ajustes recomendados (HTTPS, permalinks e cache).</p>',
  },
  {
    title: 'Configurando seu primeiro VPS — vídeo prático',
    slug: 'video-configurando-primeiro-vps',
    type: 'VIDEO',
    categorySlug: 'vps',
    excerpt: 'Provisionamento, acesso SSH inicial e instalação de stack LEMP em 12 minutos.',
    metaTitle: 'Vídeo: configurar VPS na TurboCloud',
    metaDesc: 'Tutorial em vídeo desde o provisionamento até subir Nginx, MySQL e PHP em um VPS novo.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: '<p>Mostramos o fluxo completo: escolha de plano, sistema operacional (Ubuntu 24.04), criação do par de chaves SSH, primeiro acesso, hardening básico (porta, fail2ban) e instalação da stack LEMP.</p>',
  },
  {
    title: 'Vídeo: configurando SPF, DKIM e DMARC',
    slug: 'video-spf-dkim-dmarc',
    type: 'VIDEO',
    categorySlug: 'email',
    excerpt: 'Os três registros que fazem seus e-mails caírem (ou não) em spam.',
    metaTitle: 'Vídeo: SPF, DKIM e DMARC na TurboCloud',
    metaDesc: 'Configure SPF, DKIM e DMARC seguindo o vídeo e veja a diferença na entregabilidade em uma semana.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: '<p>Em 8 minutos, configuramos os 3 registros essenciais de autenticação de e-mail e mostramos como validar com o MXToolbox. Inclui também a leitura básica do relatório de DMARC.</p>',
  },
  {
    title: 'Webinar: estratégias de afiliação que convertem',
    slug: 'video-webinar-afiliacao-converte',
    type: 'VIDEO',
    categorySlug: 'afiliados',
    excerpt: 'Webinar gravado com top afiliados TurboCloud compartilhando táticas reais.',
    metaTitle: 'Webinar afiliados TurboCloud',
    metaDesc: 'Aprenda com quem mais converte: SEO, tráfego pago, e-mail marketing e funis para afiliados.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: '<p>Webinar de 45 minutos com 3 dos maiores afiliados TurboCloud em 2025. Eles compartilham canais que funcionam, abordagens de copy e o que aprenderam errando ao longo dos primeiros anos.</p>',
  },
]

async function seedArticles() {
  const admin = await prisma.user.findUnique({ where: { email: SEED_ADMIN_EMAIL } })
  if (!admin) throw new Error('Usuário admin não encontrado — não foi possível criar artigos.')

  const allCategories = await prisma.category.findMany({ select: { id: true, slug: true } })
  const catBySlug = new Map(allCategories.map((c) => [c.slug, c.id]))

  const allArticles: ArticleSeed[] = [...TEXT_ARTICLES, ...SUPPORT_ARTICLES, ...VIDEO_ARTICLES]
  let created = 0
  let updated = 0

  for (const a of allArticles) {
    const categoryId = catBySlug.get(a.categorySlug)
    if (!categoryId) {
      console.warn(`⚠️  Categoria "${a.categorySlug}" não encontrada — artigo "${a.title}" pulado.`)
      continue
    }

    const status: ArticleStatus = a.status ?? 'PUBLISHED'
    const payload = {
      title: a.title,
      slug: a.slug,
      type: a.type,
      content: a.content,
      excerpt: a.excerpt,
      videoUrl: a.type === 'VIDEO' ? (a.videoUrl ?? null) : null,
      metaTitle: a.metaTitle,
      metaDesc: a.metaDesc,
      status,
      featured: a.featured ?? false,
      categoryId,
      authorId: admin.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    }

    const existing = await prisma.article.findUnique({ where: { slug: a.slug } })

    if (existing) {
      await prisma.article.update({ where: { id: existing.id }, data: payload })
      if (a.type === 'SUPPORT') {
        await prisma.supportBlock.deleteMany({ where: { articleId: existing.id } })
        if (a.supportBlocks && a.supportBlocks.length > 0) {
          await prisma.supportBlock.createMany({
            data: a.supportBlocks.map((b, i) => ({
              articleId: existing.id,
              order: i,
              title: b.title,
              badge: b.badge ?? null,
              content: b.content,
            })),
          })
        }
      }
      updated++
    } else {
      await prisma.article.create({
        data: {
          ...payload,
          supportBlocks: a.type === 'SUPPORT' && a.supportBlocks?.length
            ? {
                create: a.supportBlocks.map((b, i) => ({
                  order: i,
                  title: b.title,
                  badge: b.badge ?? null,
                  content: b.content,
                })),
              }
            : undefined,
        },
      })
      created++
    }
  }

  console.log(`✅ Artigos: ${created} criados, ${updated} atualizados (10 TEXT + 10 SUPPORT + 5 VIDEO).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
