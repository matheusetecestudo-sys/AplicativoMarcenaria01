# ⚠️ Correção do Link de "Esqueci a Senha"

O erro **"localhost recusou estabelecer ligação"** acontece porque o Supabase está configurado para usar `localhost` como o site padrão. Para que o link enviado por e-mail funcione na versão online (celular ou outros computadores), você precisa alterar essa configuração no painel do Supabase.

### Passo a Passo:

1.  Acesse o painel do seu projeto no **Supabase** (app.supabase.com).
2.  No menu lateral esquerdo, vá em **Authentication** -> **URL Configuration**.
3.  **Site URL**: Altere de `http://localhost:3000` para a URL do seu site publicado (ex: `https://seu-app.vercel.app`).
4.  **Redirect URLs**:
    *   Adicione a URL do seu site publicado aqui também.
    *   Exemplo: `https://seu-app.vercel.app/**` (o `**` serve para aceitar sub-rotas).
    *   Mantenha o `http://localhost:3000` na lista se você ainda quiser testar localmente no seu PC.
5.  Clique em **Save**.

### Testando

Após salvar, tente solicitar a redefinição de senha novamente pelo seu site publicado. O link no e-mail agora deverá começar com `https://seu-app...` em vez de `http://localhost...`.
