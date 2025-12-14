# Como Adicionar o Botão de Login com GitHub

## Arquivo: `pages/Login.tsx`

### Passo 1: Imports já foram adicionados ✅
Os imports do GitHubLoginButton já foram adicionados automaticamente no arquivo.

### Passo 2: Adicionar o Botão GitHub

Localize a linha 137 (após o botão "Entrar") e adicione o seguinte código **ANTES** da div que contém os botões "Solicitar Cadastro" e "Esqueci a Senha":

```tsx
{/* GitHub OAuth Button */}
\u003cdiv className="relative my-6">
    \u003cdiv className="absolute inset-0 flex items-center">
        \u003cdiv className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-700">\u003c/div>
    \u003c/div>
    \u003cdiv className="relative flex justify-center text-xs uppercase">
        \u003cspan className="bg-white dark:bg-[#111] px-3 text-gray-500 font-black tracking-wider">Ou continue com\u003c/span>
    \u003c/div>
\u003c/div>

\u003cGitHubLoginButton 
    onError={(error) => setMessage({ type: 'error', text: error })}
    onLoading={setIsLoading}
/>
```

## Resultado Esperado

A tela de login deve ficar assim:

```
[Campo Email]
[Campo Senha]
[Botão "ENTRAR"]

─────── Ou continue com ───────

[Botão "ENTRAR COM GITHUB" (preto com logo)]

[Solicitar Cadastro]  [Esqueci a Senha]
```

## Se Preferir Fazer Manualmente

1. Abra o arquivo `pages/Login.tsx` no seu editor
2. Procure pela linha com o botão "Entrar" (linha ~137)
3. Logo após o `\u003c/button>` do botão Entrar
4. **ANTES** da `\u003cdiv className="flex justify-between items-center mt-4 pt-4..."`
5. Cole o código acima

## Opção Alternativa: Arquivo Completo

Se preferir, posso criar um arquivo completo `Login.tsx` atualizado para você substituir.
Basta me avisar!
