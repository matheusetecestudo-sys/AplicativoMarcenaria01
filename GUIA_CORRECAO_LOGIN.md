# GUIA DE SOLUÇÃO: "Caminho Inválido"

O erro `{"error":"o caminho solicitado é inválido"}` acontece quando o Supabase bloqueia o link de recuperação por segurança. Isso ocorre porque o endereço do seu site (Vercel) não está na "Lista de Permitidos".

### Como Resolver (Definitivo)

1.  Acesse **[app.supabase.com](https://app.supabase.com)** e entre no seu projeto.
2.  No menu esquerdo, clique em **Authentication** e depois em **URL Configuration**.
3.  Procure a seção **Redirect URLs**.
4.  Você precisa adicionar **EXATAMENTE** o endereço que aparece no navegador quando você abre seu site.
    *   Exemplo: `https://rino-score.vercel.app` (sem barra no final)
    *   E também: `https://rino-score.vercel.app/**` (com asteriscos)
5.  **DICA:** Na nova tela de Login (após a atualização que acabei de fazer), ao clicar em "Esqueci a Senha", eu mostro exatamente qual URL você precisa adicionar.
6.  Clique em **SAVE**.

### Passo Final (Crucial)
**Após salvar no Supabase, você DEVE solicitar um NOVO link de recuperação.**
O link antigo que você recebeu por e-mail **não funcionará mais**, pois ele foi gerado com a configuração errada.

### Teste
1.  Abra seu app.
2.  Vá em "Esqueci a Senha".
3.  Digite seu email e envie.
4.  Aguarde o novo email.
5.  Clique no link -> Agora deve abrir o site e pedir a nova senha.
