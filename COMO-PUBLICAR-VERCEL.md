# Publicando na Vercel 🚀

Seu projeto já está preparado e configurado para a Vercel!

## Passo 1: Enviar código para o GitHub
Certifique-se de que todo o seu código está no GitHub. Se o comando automático falhou, rode:
```bash
git push
```

## Passo 2: Criar Projeto na Vercel
1. Acesse https://vercel.com/new
2. Importe o repositório **AplicativoMarcenaria**.
3. Na tela de configuração ("Configure Project"), **NÃO CLIQUE EM DEPLOY AINDA**.

## Passo 3: Configurar Variáveis (Crucial!)
Na seção **Environment Variables**, você precisa adicionar as mesmas chaves que usamos no computador:

| Name | Value (Valor) |
|------|--------------|
| `VITE_SUPABASE_URL` | `https://bykrxtibtaqszogkfaqv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `(Copie a chave longa do seu arquivo .env.local)` |

> **Dica:** Você pode abrir o arquivo `.env.local` no seu computador, copiar o conteúdo e colar lá.

## Passo 4: Deploy
- Clique em **Deploy**.
- Aguarde uns instantes.
- Pronto! Seus clientes poderão acessar o sistema pelo link gerado (ex: `aplicativo-marcenaria.vercel.app`).

---

### Observação importante sobre Login Social
Se você usar o login com GitHub em produção, você precisará adicionar o domínio da Vercel (ex: `https://seusite.vercel.app`) na lista de **Redirect URLs** lá no painel do Supabase (Authentication -> URL Configuration).
