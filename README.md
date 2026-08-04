# 🌿 Site de Casamento Élfico — Fabio & Michele

Este é o site de casamento de **Fabio e Michele**, inspirado no conto de **Beren e Lúthien** de J.R.R. Tolkien. 

Ele conta com uma estética élfica mágica, contagem regressiva ativa para o dia **21/09/2027**, história do casal, lista de presentes virtuais (cotas com PIX) e formulário de confirmação de presença (RSVP) integrado a uma planilha privada do Google.

---

## ✨ Funcionalidades Principais

*   **Identidade Visual Personalizada:** Tons de verde floresta, azul crepúsculo, marfim e dourado estelar, com tipografias clássicas de fantasia (*Cinzel* e *Cormorant Garamond*).
*   **Contador Regressivo:** Atualizado em tempo real até a data do casamento.
*   **Lista de Presentes de Valinor:** Cotas virtuais temáticas da Terra Média (ex: *Passagem de Águia para Lua de Mel*, *Banquete no Pônei Saltitante*). Inclui modal com QR Code e botão de cópia automática da chave PIX.
*   **Confirmação de Presença (RSVP):** Formulário integrado diretamente a uma Planilha do Google do casal, garantindo segurança e privacidade absoluta (ninguém consegue ver quem já confirmou, apenas você e o Fabio).
*   **Painel de Testes Local (Backup):** Se a planilha do Google não estiver configurada, o site salva temporariamente as confirmações na memória do navegador. Um cadeado dourado no canto inferior direito permite abrir um painel secreto (senha: `beren`) para ver e baixar essa lista de teste em Excel/CSV. Quando a planilha real for conectada, esse painel de testes é desativado automaticamente.

---

## ⚙️ Como Integrar com o Google Planilhas (Google Sheets)

Para coletar as confirmações de presença dos convidados de forma privada e 100% segura, siga este passo a passo:

### Passo 1: Criar a Planilha no seu Google Drive
1. Abra o [Google Planilhas](https://sheets.google.com) usando a sua conta do Google.
2. Crie uma planilha em branco chamada **"Confirmados Casamento"**.
3. (Opcional) Escreva na primeira linha os cabeçalhos para organizar:
   * Coluna A: **Nome**
   * Coluna B: **E-mail**
   * Coluna C: **WhatsApp**
   * Coluna D: **Presença**
   * Coluna E: **Acompanhantes**
   * Coluna F: **Nomes dos Acompanhantes**
   * Coluna G: **Mensagem**
   * Coluna H: **Data de Confirmação**

### Passo 2: Adicionar o Código de Integração
1. No menu superior da planilha, clique em **Extensões** (Extensions) e depois em **Apps Script**.
2. Apague qualquer código que estiver na janela de edição e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Insere os dados na planilha como uma nova linha (8 colunas)
    sheet.appendRow([
      data.name,
      data.email,
      data.whatsapp,
      data.attendance,
      data.companions,
      data.companionNames || "", // Nova coluna!
      data.message,
      data.date || new Date().toLocaleString("pt-BR")
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}
```

3. Clique no ícone de disquete (**Salvar projeto**) no menu superior do Apps Script.

### Passo 3: Publicar a Integração como Aplicativo Web
1. No canto superior direito da tela do Apps Script, clique no botão azul **Implantar** (Deploy) e escolha **Nova implantação** (New deployment).
2. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e selecione **Aplicativo da Web** (Web App).
3. Preencha as configurações exatamente assim:
   * **Descrição:** RSVP Casamento
   * **Executar como:** Eu (seu e-mail do Google)
   * **Quem tem acesso:** Qualquer pessoa (Anyone) — *esta opção é obrigatória para que o site consiga enviar os dados dos convidados*.
4. Clique em **Implantar** (Deploy).
5. O Google pedirá que você autorize o acesso à sua conta. Clique em **"Autorizar acesso"**, escolha sua conta, depois clique em **"Avançado"** (Advanced) no final do aviso de segurança do Google e selecione **"Ir para Projeto Sem Nome (não seguro)"**. Depois clique em **Permitir**.
6. Copie a **URL do aplicativo da Web** que aparecerá na tela (ela começa com `https://script.google.com/macros/s/.../exec`).

### Passo 4: Conectar a URL ao Site
1. Abra o arquivo **`script.js`** do seu projeto no computador.
2. Na linha 4, localize a variável `GOOGLE_SHEET_URL`.
3. Substitua o texto `"SUA_URL_DO_GOOGLE_SCRIPT_AQUI"` pela URL que você acabou de copiar da implantação do Google.
   * *Exemplo:* `const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxyz.../exec";`
4. Salve o arquivo `script.js` e envie as atualizações para o seu repositório no GitHub.

---

## 🚀 Como Hospedar no GitHub Pages (Gratuito)

Como o projeto já está conectado ao seu GitHub, toda alteração salva na sua máquina pode ser enviada para lá.

Se você alterar o arquivo `script.js` para colocar sua URL da planilha, basta abrir o terminal do Git na pasta do projeto e rodar:

```bash
git add .
git commit -m "Update: Adiciona conexao com Google Planilhas"
git push
```

### Como ativar o site no GitHub:
1. No seu repositório do GitHub, vá em **Settings** (Configurações) no menu superior.
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção "Build and deployment", selecione a branch **`main`**, a pasta **`/(root)`** e clique em **Save** (Salvar).
4. O link do seu site ficará online em cerca de 1 minuto!
