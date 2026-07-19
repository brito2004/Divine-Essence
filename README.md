# 🌸 Divine Essence — Catálogo Online

Perfumaria premium com catálogo público e painel administrativo completo.

---

## 🚀 Rodando Localmente

```bash
# 1. Instale as dependências (já roda o setup automaticamente)
npm install

# 2. Inicie o servidor
npm start
```

Acesse em **http://localhost:3000**
Painel admin em **http://localhost:3000/admin/login**

| Campo | Valor |
|---|---|
| Email | `admin@divineessence.com` |
| Senha | `Admin@2024!` |

Para desenvolvimento com auto-reload: `npm run dev`

---

## ☁️ Deploy no Railway (Produção)

### Pré-requisitos
- Conta no [Railway](https://railway.app) (gratuita)
- Conta no [GitHub](https://github.com) (gratuita)
- [Git](https://git-scm.com) instalado

### Passo a passo

**1. Suba o código para o GitHub**
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/divine-essence.git
git push -u origin main
```

**2. Crie o projeto no Railway**
- Acesse [railway.app](https://railway.app) → New Project
- Escolha **Deploy from GitHub repo**
- Selecione o repositório `divine-essence`

**3. Adicione o banco PostgreSQL**
- No painel do projeto, clique em **+ New** → **Database** → **PostgreSQL**
- O Railway cria o banco e define `DATABASE_URL` automaticamente

**4. Configure as variáveis de ambiente**
- Clique no seu serviço Node.js → aba **Variables** → **Add Variables**

```
NODE_ENV          = production
SESSION_SECRET    = cole_uma_string_aleatoria_longa_aqui
ADMIN_EMAIL       = seu@email.com
ADMIN_SENHA       = SuaSenhaForte@2024
ADMIN_NOME        = Administrador
```

> Gere o SESSION_SECRET com:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**5. Deploy**
- Railway faz o deploy automaticamente após salvar as variáveis
- O setup do banco roda sozinho via `postinstall`
- Acesse a URL gerada pelo Railway (ex: `divine-essence.up.railway.app`)

---

## 📁 Estrutura

```
Divine-Essence/
├── src/
│   ├── app.js                    # Entrada do servidor
│   ├── config/database.js        # Adapter SQLite/PostgreSQL
│   ├── controllers/              # Lógica de cada rota
│   ├── models/                   # Acesso ao banco
│   ├── views/                    # Templates EJS
│   ├── routes/                   # Definição de rotas
│   ├── middlewares/              # Auth, upload
│   └── public/                   # CSS, JS, imagens
├── database/
│   └── setup.js                  # Cria tabelas e admin inicial
├── Procfile                      # Comando de start (Railway/Heroku)
├── railway.toml                  # Configuração Railway
├── .env.example                  # Modelo de variáveis
└── package.json
```

---

## 🔒 Segurança

- Senhas com bcrypt (salt 12)
- Sessões HTTP-only
- Headers de segurança via Helmet
- Cookies `secure` em produção
- Middleware de autenticação em todas as rotas admin

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express |
| Banco (dev) | SQLite via node-sqlite3-wasm |
| Banco (prod) | PostgreSQL via pg |
| Templates | EJS |
| Autenticação | express-session + bcryptjs |
| Segurança | Helmet |
| Upload | express-fileupload |
