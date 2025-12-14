# Guia de Configuração - GitHub + Supabase

Este guia explica como conectar o aplicativo ao GitHub e configurar autenticação com Supabase.

## Parte 1: Criar Repositório no GitHub

### Passo 1: Criar novo repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login
2. Clique no ícone **+** no canto superior direito e selecione "New repository"
3. Preencha:
   - **Repository name**: `aplicativo-marcenaria-gabriel`
   - **Description**: "Aplicativo de gestão para marcenaria com Supabase"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO** marque "Initialize with README" (já temos arquivos)
4. Clique em "Create repository"

### Passo 2: Conectar o repositório local ao GitHub
Após criar o repositório, o GitHub mostrará comandos. Você já tem um repositório Git local, então use:

```bash
git remote add origin https://github.com/SEU_USUARIO/aplicativo-marcenaria-gabriel.git
git branch -M main
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub**

## Parte 2: Configurar Supabase

### Passo 1: Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login (ou crie uma conta)
2. Clique em "New Project"
3. Preencha:
   - **Name**: `marcenaria-gabriel`
   - **Database Password**: Crie uma senha forte e **SALVE**
   - **Region**: Escolha o mais próximo (ex: South America - São Paulo)
4. Clique em "Create new project" e aguarde ~2 minutos

### Passo 2: Obter as credenciais do Supabase
1. No painel do projeto, vá em **Settings** (ícone de engrenagem) → **API**
2. Copie os seguintes valores:
   - **Project URL** (algo como: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

### Passo 3: Criar arquivo `.env.local`
1. **Crie um arquivo** chamado `.env.local` na raiz do projeto
2. Cole o seguinte conteúdo, substituindo pelos seus valores:

```env
VITE_SUPABASE_URL=https://sua_url.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**IMPORTANTE**: Nunca compartilhe esse arquivo nem faça commit dele no Git! (Ele já está no `.gitignore`)

### Passo 4: Configurar GitHub OAuth no Supabase

1. No Supabase, vá em **Authentication** → **Providers**
2. Encontre **GitHub** na lista e clique para expandir
3. Marque **"Enable GitHub provider"**
4. Você verá:
   - **Client ID**: (deixe em branco por enquanto)
   - **Client Secret**: (deixe em branco por enquanto)
   - **Callback URL**: Copie este valor (algo como `https://xxxxx.supabase.co/auth/v1/callback`)

### Passo 5: Criar OAuth App no GitHub

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em **"New OAuth App"**
3. Preencha:
   - **Application name**: `Marcenaria Gabriel App`
   - **Homepage URL**: `http://localhost:3000` (para desenvolvimento)
   - **Authorization callback URL**: Cole a **Callback URL** copiada do Supabase
4. Clique em **"Register application"**
5. Copie o **Client ID** exibido
6. Clique em **"Generate a new client secret"** e copie o **Client Secret**

### Passo 6: Finalizar configuração no Supabase

1. Volte para o Supabase → **Authentication** → **Providers** → **GitHub**
2. Cole o **Client ID** e **Client Secret** copiados do GitHub
3. Clique em **"Save"**

## Parte 3: Testar a Autenticação

### Reiniciar o servidor
No terminal, pare o servidor (`Ctrl+C`) e inicie novamente:

```bash
npm run dev
```

### Testar login com GitHub
1. Abra `http://localhost:3000`
2. Você verá um botão **"Entrar com GitHub"**
3. Clique nele e você será redirecionado para o GitHub
4. Autorize o aplicativo
5. Você será redirecionado de volta e autenticado!

## Parte 4: Comandos Git Úteis

### Fazer commit das mudanças
```bash
git add .
git commit -m "Adicionada autenticação com Supabase e GitHub OAuth"
git push
```

### Ver status do repositório
```bash
git status
```

### Ver histórico de commits
```bash
git log --oneline
```

### Criar uma branch nova
```bash
git checkout -b nome-da-feature
```

## Próximos Passos (Opcional)

### Deploy em Produção
Para colocar em produção, você pode usar:
- **Vercel** (recomendado para apps Vite/React)
- **Netlify**
- **GitHub Pages**

Quando fizer deploy, lembre-se de:
1. Adicionar as variáveis de ambiente no serviço de hosting
2. Atualizar a **Homepage URL** no GitHub OAuth App para a URL de produção
3. Adicionar a URL de produção também no Supabase → Authentication → URL Configuration

## Troubleshooting

### "Supabase not configured"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `VITE_`
- Reinicie o servidor após criar/editar o `.env.local`

### "Invalid client credentials" no GitHub
- Verifique se copiou corretamente o Client ID e Secret
- Confirme que a Callback URL está correta

### Erro ao fazer push para GitHub
- Se aparecer erro de autenticação, configure o Git:
  ```bash
  git config user.name "Seu Nome"
  git config user.email "seu@email.com"
  ```
