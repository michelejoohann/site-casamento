# 🌿 Site de Casamento Élfico — Fabio & Michele

Este é o site de casamento personalizado de **Fabio e Michele**, inspirado no lendário conto de **Beren e Lúthien** de J.R.R. Tolkien. 

Ele conta com uma estética mágica e élfica, contagem regressiva ativa para o dia **21/09/2027**, história do casal, lista de presentes virtuais (cotas com PIX) e formulário de confirmação de presença (RSVP) com um painel administrativo oculto integrado.

---

## ✨ Funcionalidades Principais

*   **Identidade Visual Personalizada:** Tons de verde floresta, azul crepúsculo, marfim e dourado estelar, com tipografias clássicas de fantasia (*Cinzel* e *Cormorant Garamond*).
*   **Contador Regressivo:** Atualizado em tempo real até a data do casamento.
*   **Lista de Presentes de Valinor:** Sugestões divertidas baseadas na Terra Média (ex: *Passagem de Águia para Lua de Mel*, *Banquete no Pônei Saltitante*). Inclui modal com QR Code e botão de cópia automática da chave PIX.
*   **Confirmação de Presença (RSVP):** Formulário completo integrado.
*   **Painel Admin Secreto (Dashboard):** Um painel oculto no canto inferior direito do site, protegido por senha, para gerenciar as confirmações.
    *   **Senha padrão:** `beren`
    *   Exibe a lista de confirmados e acompanhantes.
    *   Permite abrir o WhatsApp de contato do convidado com um clique.
    *   Permite exportar todos os dados para um arquivo Excel/CSV.

---

## 🚀 Como Hospedar no GitHub Pages (Gratuito e Rápido)

Siga os passos simples abaixo para colocar o seu site no ar gratuitamente no seu GitHub:

### Passo 1: Criar o Repositório no GitHub
1. Acesse sua conta no [GitHub](https://github.com).
2. Clique no botão **"New"** (ou no símbolo `+` no canto superior direito e escolha "New repository").
3. Dê um nome para o repositório (por exemplo: `casamento` ou `site-casamento`).
4. Deixe o repositório como **Public** (Público) — isso é necessário para usar o GitHub Pages de forma gratuita.
5. Deixe desmarcadas as opções de inicialização (não adicione README, .gitignore ou licença) e clique em **"Create repository"**.

### Passo 2: Subir os Arquivos para o GitHub
Você pode fazer isso de duas formas:

#### Opção A (Pelo Navegador — Mais Simples):
1. Na página do repositório recém-criado, clique no link **"uploading an existing file"** (na parte superior).
2. Arraste e solte os 4 arquivos deste projeto (`index.html`, `style.css`, `script.js` e esta `README.md`) para a área demarcada.
3. Aguarde o carregamento e, na parte inferior da página, clique no botão verde **"Commit changes"**.

#### Opção B (Por Linha de Comando — Git):
Se você já possui o Git instalado na sua máquina, abra o terminal na pasta do projeto e rode:
```bash
git init
git add .
git commit -m "Initial commit: Site de casamento élfico"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git push -u origin main
```
*(Substitua `SEU_USUARIO` e `NOME_DO_REPOSITORIO` pelos seus dados reais no GitHub).*

### Passo 3: Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações) na barra de navegação superior.
2. No menu lateral esquerdo, na seção "Code and automation", clique em **Pages**.
3. Na seção "Build and deployment":
   * **Source:** Selecione *Deploy from a branch*.
   * **Branch:** Clique no menu onde diz *None*, mude para **main** (ou `master`) e deixe a pasta como **/(root)**.
4. Clique no botão **Save** (Salvar).
5. Aguarde cerca de 1 a 2 minutos. Atualize a página e você verá uma caixa no topo da seção Pages dizendo: **"Your site is live at..."** seguido do link público do seu site!

---

## ⚙️ Como Personalizar os Detalhes do Site

Todas as configurações principais estão organizadas nos arquivos de forma simples para quando vocês definirem os locais e chaves PIX reais:

*   **Chave PIX e Destinatário:**
    *   Abra o arquivo `index.html`.
    *   Use a busca por `pix@casamentofabioemichele.com.br` e troque pela sua chave PIX real (pode ser CPF, celular, e-mail ou chave aleatória).
    *   Logo abaixo, altere o nome do destinatário (linha 352) e o banco para o seu banco real.
*   **Local e Mapa:**
    *   No arquivo `index.html`, localize a seção do Local (linhas 125-133). Assim que definirem, vocês podem substituir o texto "A definir" pelo endereço real e preencher a URL do Google Maps no botão `<button>`.
*   **Senha do Painel de Confirmados:**
    *   No topo do arquivo `script.js` (linha 3), mude a palavra `"beren"` para a senha de sua preferência.
