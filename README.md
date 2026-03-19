# Batalha dos Farroups 2026 🏆

Site oficial da Batalha dos Farroups 2026 — competição do nono ano.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **CSS Modules**
- Deploy via **Vercel**

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy no Vercel

1. Faça push do projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. O Vercel detecta Next.js automaticamente — clique em **Deploy**
4. Pronto! Cada push na branch `main` faz deploy automático

## Estrutura do projeto

```
batalha-farroups-2026/
├── app/
│   ├── layout.tsx         # Layout raiz (Navbar + metadados)
│   ├── globals.css        # Variáveis CSS globais e estilos base
│   ├── page.tsx           # Página inicial (Hero + Stats + Avisos)
│   ├── placar/            # Classificação das equipes
│   ├── tarefas/           # Lista de tarefas teóricas e práticas
│   ├── avisos/            # Avisos oficiais
│   ├── fotos/             # Galeria de fotos
│   └── professores/       # Área administrativa (requer login)
├── components/
│   ├── Navbar.tsx         # Barra de navegação
│   └── LoginModal.tsx     # Modal de login dos professores
└── README.md
```

## Login de professor (protótipo)

Por enquanto o login é simulado:
- **Usuário:** `professor`
- **Senha:** `2026`

> Para produção, integre com Firebase Auth, Supabase ou NextAuth.js.

## Próximos passos sugeridos

- [ ] Integrar banco de dados (Supabase ou Firebase) para tarefas e placar dinâmicos
- [ ] Adicionar autenticação real com NextAuth.js
- [ ] Criar painel do professor para publicar tarefas e atualizar pontuação
- [ ] Upload de fotos via Cloudinary ou Firebase Storage
- [ ] Notificações por e-mail ao publicar nova tarefa
