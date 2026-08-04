// CONFIGURAÇÕES DO CASAMENTO
// 1. Cole aqui a URL gerada pelo Google Apps Script (ex: https://script.google.com/macros/s/AKfycb.../exec)
// Se deixar como está, o site usará o painel administrativo local (localStorage) como teste.
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby5dkuaZIYN9XMYR8PvZDPa68TD3g_OOLVMaRfd826DWDP64JFb75yCJocbVNVfeH0i/exec";

const CASAMENTO_DATE = new Date("2027-09-21T19:00:00").getTime(); // 21 de Setembro de 2027, 19:00h
const ADMIN_PASSWORD = "beren"; // Senha para o painel de testes local

// 2. LISTA OFICIAL DE CONVIDADOS E LIMITE DE ACOMPANHANTES
// Chave: Nome exato do convidado principal (como você enviará no convite).
// Valor: Limite máximo de acompanhantes que essa pessoa pode levar (0 significa individual).
// O sistema é inteligente: ele ignora acentos, maiúsculas/minúsculas e espaços extras ao validar.
const GUEST_LIST = {
  "Brixius": 1,
  "Dani, Jardel, Livia, Alice e acompanhantes": 5, // Dani + 5 acompanhantes (Jardel, Livia, Alice + 2 extras) = 6 pessoas no total
  "Fabio": 0,
  "Michele": 0,
  "Elrond": 1,
  "Arwen Undomiel": 2,
  "Galadriel": 3,
  "Frodo Bolseiro": 0,
  "Samwise Gamgi": 1
};

// Elementos da página
const elDays = document.getElementById("days");
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");

const labelDays = document.getElementById("label-days");
const labelHours = document.getElementById("label-hours");
const labelMinutes = document.getElementById("label-minutes");
const labelSeconds = document.getElementById("label-seconds");

// Elementos do RSVP e Estado Global
const rsvpForm = document.getElementById("rsvp-form");
const inputName = document.getElementById("name");
const btnSearchInvite = document.getElementById("btn-search-invite");
const validationMsg = document.getElementById("validation-msg");
const rsvpFields = document.getElementById("rsvp-fields");
const companionsSelect = document.getElementById("companions");
const companionNamesContainer = document.getElementById("companion-names-container");
const companionsGroup = document.getElementById("companions-group");
const btnSubmitRsvp = document.getElementById("btn-submit-rsvp");
const radioAttendance = document.getElementsByName("attendance");

let validatedGuestName = "";
let validatedLimit = 0;

// =========================================
// 1. SELETOR DE IDIOMAS (BILINGUE)
// =========================================
const translations = {
  pt: {
    days: "Dias", hours: "Horas", minutes: "Minutos", seconds: "Segundos",
    placeholderName: "Seu nome como está no convite",
    placeholderEmail: "Ex: elrond@valfenda.com",
    placeholderWhatsapp: "Ex: (11) 99999-9999",
    placeholderMsg: "Escreva aqui se tiver alguma alergia alimentar ou um recado elfo...",
    submitBtn: "Enviar Confirmação",
    submitBtnSending: "Enviando...",
    successConfirmed: "Obrigado pela confirmação, {name}! Nos vemos no dia 21 de Setembro de 2027! 🌿✨",
    successAbsent: "Sentiremos sua falta, {name}! Agradecemos por nos avisar. 🤍",
    errorSubmit: "Houve um erro ao enviar sua confirmação. Por favor, tente novamente.",
    copiar: "Copiar",
    copiado: "Copiado!",
    adminTitle: "Presente Selecionado",
    searchSuccess: "Olá, {name}! Convite localizado. Você pode confirmar sua presença e de até {limit} acompanhante(s).",
    searchSuccessIndividual: "Olá, {name}! Convite localizado. Confirmar convite individual.",
    searchError: "Desculpe, não encontramos seu nome na lista de convidados. Por favor, digite o nome completo ou contate os noivos.",
    searchTooShort: "Por favor, digite pelo menos 3 letras para realizar a busca.",
    companionLabel: "Nome do Acompanhante {num}",
    companionPlaceholder: "Nome completo do acompanhante",
    companionsOptions: {
      justMe: "Apenas eu (0 acompanhantes)",
      one: "1 acompanhante",
      multiple: "{num} acompanhantes"
    }
  },
  en: {
    days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds",
    placeholderName: "Your name as written on the invitation",
    placeholderEmail: "e.g., elrond@rivendell.com",
    placeholderWhatsapp: "e.g., +1 (123) 456-7890",
    placeholderMsg: "Write here if you have any food allergies or a warm message...",
    submitBtn: "Send RSVP",
    submitBtnSending: "Sending...",
    successConfirmed: "Thank you for confirming, {name}! See you on September 21, 2027! 🌿✨",
    successAbsent: "We will miss you, {name}! Thank you for letting us know. 🤍",
    errorSubmit: "There was an error sending your confirmation. Please try again.",
    copiar: "Copy",
    copiado: "Copied!",
    adminTitle: "Selected Gift",
    searchSuccess: "Hello, {name}! Invitation found. You can confirm attendance for yourself and up to {limit} companion(s).",
    searchSuccessIndividual: "Hello, {name}! Invitation found. Confirming individual invitation.",
    searchError: "Sorry, we could not find your name on the guest list. Please check the spelling or contact the couple.",
    searchTooShort: "Please type at least 3 letters to search.",
    companionLabel: "Companion {num} Name",
    companionPlaceholder: "Companion's full name",
    companionsOptions: {
      justMe: "Just me (0 companions)",
      one: "1 companion",
      multiple: "{num} companions"
    }
  }
};

let currentLanguage = localStorage.getItem("wedding_lang") || "pt";

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("wedding_lang", lang);

  // Classe no body para controle CSS
  document.body.className = "lang-" + lang;

  // Botões de idioma ativos
  document.getElementById("btn-lang-pt").classList.toggle("active", lang === "pt");
  document.getElementById("btn-lang-en").classList.toggle("active", lang === "en");

  // Rótulos do cronômetro
  labelDays.textContent = translations[lang].days;
  labelHours.textContent = translations[lang].hours;
  labelMinutes.textContent = translations[lang].minutes;
  labelSeconds.textContent = translations[lang].seconds;

  // Placeholders do formulário
  document.getElementById("name").placeholder = translations[lang].placeholderName;
  document.getElementById("email").placeholder = translations[lang].placeholderEmail;
  document.getElementById("whatsapp").placeholder = translations[lang].placeholderWhatsapp;
  document.getElementById("message").placeholder = translations[lang].placeholderMsg;

  // Botão de envio
  const btnSubmit = document.getElementById("btn-submit-rsvp");
  if (btnSubmit) {
    btnSubmit.querySelector("span.lang-pt").textContent = translations.pt.submitBtn;
    btnSubmit.querySelector("span.lang-en").textContent = translations.en.submitBtn;
  }
  
  // Atualiza as opções do dropdown de acompanhantes no idioma correto se o convite já foi buscado
  if (validatedGuestName) {
    const currentSelectedVal = companionsSelect.value;
    const currentCompanionNames = Array.from(document.querySelectorAll(".companion-name-input")).map(inp => inp.value);
    buildCompanionsDropdown(validatedLimit);
    companionsSelect.value = currentSelectedVal;
    
    // Recria os inputs e recoloca os valores
    companionsSelect.dispatchEvent(new Event("change"));
    document.querySelectorAll(".companion-name-input").forEach((inp, idx) => {
      if (currentCompanionNames[idx]) inp.value = currentCompanionNames[idx];
    });
  }
  
  // Atualiza os placeholders dos inputs de acompanhantes se estiverem visíveis
  document.querySelectorAll(".companion-name-input").forEach((input, index) => {
    input.placeholder = translations[lang].companionPlaceholder;
    const label = input.previousElementSibling;
    if (label) {
      label.querySelector("span.lang-pt").textContent = translations.pt.companionLabel.replace("{num}", index + 1);
      label.querySelector("span.lang-en").textContent = translations.en.companionLabel.replace("{num}", index + 1);
    }
  });
}

// Inicializa o idioma
setLanguage(currentLanguage);

// =========================================
// 2. CONTADOR REGRESSIVO
// =========================================
function updateCountdown() {
  const now = new Date().getTime();
  const diff = CASAMENTO_DATE - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = `<div class='countdown-box' style='width:100%;'><span class='countdown-number'>${currentLanguage === 'pt' ? 'Chegou o Grande Dia!' : 'The Big Day Has Arrived!'}</span></div>`;
    clearInterval(countdownInterval);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  elDays.textContent = String(days).padStart(2, "0");
  elHours.textContent = String(hours).padStart(2, "0");
  elMinutes.textContent = String(minutes).padStart(2, "0");
  elSeconds.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// =========================================
// 3. MODAL DE PRESENTES E ABAS BILINGUES
// =========================================
const giftModal = document.getElementById("gift-modal");
const closeGiftModal = document.getElementById("close-gift-modal");
const modalGiftTitle = document.getElementById("modal-gift-title");
const modalGiftPrice = document.getElementById("modal-gift-price");
const btnCopyPix = document.getElementById("btn-copy-pix");
const pixKeyVal = document.getElementById("pix-key-val");

const tabPixBtn = document.getElementById("tab-pix-btn");
const tabIntlBtn = document.getElementById("tab-intl-btn");
const tabPixContent = document.getElementById("tab-pix-content");
const tabIntlContent = document.getElementById("tab-intl-content");

// Lógica de Abas do Modal
function selectModalTab(tab) {
  if (tab === "pix") {
    tabPixBtn.classList.add("active");
    tabIntlBtn.classList.remove("active");
    tabPixContent.classList.add("active");
    tabIntlContent.classList.remove("active");
  } else {
    tabPixBtn.classList.remove("active");
    tabIntlBtn.classList.add("active");
    tabPixContent.classList.remove("active");
    tabIntlContent.classList.add("active");
  }
}

tabPixBtn.addEventListener("click", () => selectModalTab("pix"));
tabIntlBtn.addEventListener("click", () => selectModalTab("international"));

// Abrir modal de presente
document.querySelectorAll(".btn-gift").forEach(button => {
  button.addEventListener("click", () => {
    const giftTitle = currentLanguage === "en" 
      ? button.getAttribute("data-title-en") 
      : button.getAttribute("data-title-pt");
    const giftPrice = button.getAttribute("data-price");

    modalGiftTitle.textContent = giftTitle;
    
    if (giftPrice === "Livre") {
      modalGiftPrice.textContent = currentLanguage === "en" ? "Free Amount" : "Valor Livre";
    } else {
      modalGiftPrice.textContent = `R$ ${giftPrice}`;
    }

    selectModalTab("pix");
    btnCopyPix.textContent = translations[currentLanguage].copiar;
    giftModal.classList.add("active");
  });
});

// Fechar modal de presente
closeGiftModal.addEventListener("click", () => {
  giftModal.classList.remove("active");
});

// Copiar chave PIX
btnCopyPix.addEventListener("click", () => {
  navigator.clipboard.writeText(pixKeyVal.textContent).then(() => {
    btnCopyPix.textContent = translations[currentLanguage].copiado;
    btnCopyPix.style.backgroundColor = "var(--gold)";
    btnCopyPix.style.color = "var(--bg-dark)";
    setTimeout(() => {
      btnCopyPix.textContent = translations[currentLanguage].copiar;
      btnCopyPix.style.backgroundColor = "transparent";
      btnCopyPix.style.color = "var(--gold)";
    }, 2000);
  }).catch(err => {
    console.error("Falha ao copiar: ", err);
  });
});

// =========================================
// 4. FLUXO RSVP (BUSCA DE CONVITE E CONFIRMAÇÃO)
// =========================================

// Remove acentos e padroniza string para buscas seguras
function normalizeText(text) {
  return text.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Lógica de busca de convidado
function searchInvitation() {
  const typedName = inputName.value.trim();
  if (!typedName) return;

  const normalizedTyped = normalizeText(typedName);

  // Impede buscas curtas demais para evitar falsos positivos
  if (normalizedTyped.length < 3) {
    validationMsg.innerHTML = `<span style="color: #f87171;">${translations[currentLanguage].searchTooShort}</span>`;
    rsvpFields.style.display = "none";
    return;
  }

  let matchedName = "";
  let matchedLimit = 0;
  let found = false;

  // 1. Tenta correspondência exata primeiro
  for (let guest in GUEST_LIST) {
    if (normalizeText(guest) === normalizedTyped) {
      matchedName = guest;
      matchedLimit = GUEST_LIST[guest];
      found = true;
      break;
    }
  }

  // 2. Se não encontrou exato, tenta correspondência parcial (se o nome na lista contiver o termo digitado)
  if (!found) {
    for (let guest in GUEST_LIST) {
      if (normalizeText(guest).includes(normalizedTyped)) {
        matchedName = guest;
        matchedLimit = GUEST_LIST[guest];
        found = true;
        break;
      }
    }
  }

  if (found) {
    validatedGuestName = matchedName;
    validatedLimit = matchedLimit;

    // Atualiza o campo com o nome completo oficial
    inputName.value = matchedName;
    inputName.readOnly = true;
    btnSearchInvite.style.display = "none";

    // Mensagem de sucesso
    const msgTemplate = matchedLimit > 0 
      ? translations[currentLanguage].searchSuccess 
      : translations[currentLanguage].searchSuccessIndividual;
    
    validationMsg.innerHTML = `<span style="color: #4ade80;">${msgTemplate.replace("{name}", matchedName).replace("{limit}", matchedLimit)}</span>`;
    
    // Configura o seletor de acompanhantes
    buildCompanionsDropdown(matchedLimit);

    // Abre o formulário
    rsvpFields.style.display = "block";
    companionsGroup.style.display = matchedLimit > 0 ? "block" : "none";
  } else {
    // Mensagem de erro
    validationMsg.innerHTML = `<span style="color: #f87171;">${translations[currentLanguage].searchError}</span>`;
    rsvpFields.style.display = "none";
    validatedGuestName = "";
    validatedLimit = 0;
  }
}

// Preenche dinamicamente as opções de acompanhante
function buildCompanionsDropdown(limit) {
  companionsSelect.innerHTML = "";
  companionNamesContainer.innerHTML = ""; // Limpa inputs de nomes

  // Opção: Apenas eu
  const opt0 = document.createElement("option");
  opt0.value = "0";
  opt0.textContent = translations[currentLanguage].companionsOptions.justMe;
  companionsSelect.appendChild(opt0);

  // Adiciona opções até o limite máximo do convite
  for (let i = 1; i <= limit; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    if (i === 1) {
      opt.textContent = translations[currentLanguage].companionsOptions.one;
    } else {
      opt.textContent = translations[currentLanguage].companionsOptions.multiple.replace("{num}", i);
    }
    companionsSelect.appendChild(opt);
  }
}

// Cria inputs de texto para os acompanhantes
companionsSelect.addEventListener("change", () => {
  const count = parseInt(companionsSelect.value, 10);
  companionNamesContainer.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const group = document.createElement("div");
    group.className = "form-group";
    group.style.marginBottom = "1rem";
    group.style.animation = "fadeInUp 0.3s ease";
    group.innerHTML = `
      <label style="font-size: 0.9rem; color: var(--gold-light); margin-bottom: 0.4rem; display: block;">
        <span class="lang-pt">${translations.pt.companionLabel.replace("{num}", i)}</span>
        <span class="lang-en">${translations.en.companionLabel.replace("{num}", i)}</span>
      </label>
      <input type="text" class="form-control companion-name-input" required placeholder="${translations[currentLanguage].companionPlaceholder}">
    `;
    companionNamesContainer.appendChild(group);
  }
});

// Triggers para a busca
btnSearchInvite.addEventListener("click", searchInvitation);
inputName.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchInvitation();
  }
});

// Se clicar duas vezes no campo de nome já validado, libera para editar e buscar outro
inputName.addEventListener("dblclick", () => {
  if (inputName.readOnly) {
    inputName.readOnly = false;
    btnSearchInvite.style.display = "flex";
    rsvpFields.style.display = "none";
    validationMsg.innerHTML = "";
    validatedGuestName = "";
    validatedLimit = 0;
  }
});

// Esconder acompanhantes caso a resposta seja 'Ausente'
radioAttendance.forEach(radio => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "Ausente") {
      companionsGroup.style.display = "none";
      companionNamesContainer.innerHTML = "";
    } else {
      if (validatedLimit > 0) {
        companionsGroup.style.display = "block";
        // Recria os inputs de acordo com a seleção atual
        companionsSelect.dispatchEvent(new Event("change"));
      }
    }
  });
});

// Envio do RSVP
rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = validatedGuestName || inputName.value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  const companionsCount = attendance === "Ausente" ? 0 : parseInt(companionsSelect.value, 10);
  
  // Coleta os nomes digitados nos inputs de acompanhantes
  const companionInputs = document.querySelectorAll(".companion-name-input");
  const companionNames = Array.from(companionInputs)
    .map(inp => inp.value.trim())
    .filter(Boolean)
    .join(", ");

  const rsvpData = {
    name,
    email,
    whatsapp,
    attendance,
    companions: companionsCount,
    companionNames: companionNames || "", // Enviado ao Google Sheets
    message: document.getElementById("message").value.trim(),
    date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR")
  };

  // Se o Google Sheets estiver configurado
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    btnSubmitRsvp.disabled = true;
    btnSubmitRsvp.querySelector(`span.lang-${currentLanguage}`).textContent = translations[currentLanguage].submitBtnSending;

    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rsvpData)
    })
    .then(() => {
      showRsvpSuccess(name, attendance);
      resetRsvpForm();
    })
    .catch(err => {
      console.error("Erro ao enviar: ", err);
      alert(translations[currentLanguage].errorSubmit);
    })
    .finally(() => {
      btnSubmitRsvp.disabled = false;
      btnSubmitRsvp.querySelector(`span.lang-${currentLanguage}`).textContent = translations[currentLanguage].submitBtn;
    });

  } else {
    // Fallback local (localStorage)
    let currentRSVPs = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
    rsvpData.id = Date.now();
    currentRSVPs.push(rsvpData);
    localStorage.setItem("wedding_rsvps", JSON.stringify(currentRSVPs));

    showRsvpSuccess(name, attendance);
    resetRsvpForm();
  }
});

function showRsvpSuccess(name, attendance) {
  const template = attendance === "Confirmado" 
    ? translations[currentLanguage].successConfirmed 
    : translations[currentLanguage].successAbsent;
  
  alert(template.replace("{name}", name));
}

function resetRsvpForm() {
  rsvpForm.reset();
  inputName.readOnly = false;
  btnSearchInvite.style.display = "flex";
  rsvpFields.style.display = "none";
  validationMsg.innerHTML = "";
  validatedGuestName = "";
  validatedLimit = 0;
  companionNamesContainer.innerHTML = "";
}

// Auto-busca via parâmetro na URL (?g=Brixius ou ?convidado=Brixius)
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get("g") || urlParams.get("convidado") || urlParams.get("guest");
  
  if (guestParam) {
    inputName.value = decodeURIComponent(guestParam);
    searchInvitation();
  }
});

// =========================================
// 5. PAINEL ADMINISTRATIVO LOCAL (TESTES)
// =========================================
const adminBtn = document.getElementById("admin-btn");
const adminModal = document.getElementById("admin-modal");
const closeAdminModal = document.getElementById("close-admin-modal");
const btnLoginAdmin = document.getElementById("btn-login-admin");
const adminPassInput = document.getElementById("admin-pass");
const adminAuthSection = document.getElementById("admin-auth");
const adminDataSection = document.getElementById("admin-data");
const guestListRows = document.getElementById("guest-list-rows");
const btnExportCsv = document.getElementById("btn-export-csv");
const btnClearRsvp = document.getElementById("btn-clear-rsvp");

let isAdminAuthenticated = false;

// Ocultar botão do painel se o Google Sheets estiver ativo
if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
  adminBtn.style.display = "none";
}

// Abrir modal admin
adminBtn.addEventListener("click", () => {
  adminModal.classList.add("active");
  adminPassInput.value = "";
  
  if (isAdminAuthenticated) {
    adminAuthSection.style.display = "none";
    adminDataSection.style.display = "block";
    renderGuestList();
  } else {
    adminAuthSection.style.display = "block";
    adminDataSection.style.display = "none";
  }
});

// Fechar modal admin
closeAdminModal.addEventListener("click", () => {
  adminModal.classList.remove("active");
});

// Login Admin
btnLoginAdmin.addEventListener("click", performAdminLogin);
adminPassInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") performAdminLogin();
});

function performAdminLogin() {
  const password = adminPassInput.value;
  if (password === ADMIN_PASSWORD) {
    isAdminAuthenticated = true;
    adminAuthSection.style.display = "none";
    adminDataSection.style.display = "block";
    renderGuestList();
  } else {
    alert(currentLanguage === 'en' ? "Incorrect password!" : "Senha incorreta!");
    adminPassInput.value = "";
  }
}

// Renderizar Lista de Convidados
function renderGuestList() {
  const rsvps = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
  guestListRows.innerHTML = "";

  if (rsvps.length === 0) {
    guestListRows.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver);">${currentLanguage === 'en' ? 'No confirmations received yet.' : 'Nenhuma confirmação recebida ainda.'}</td></tr>`;
    return;
  }

  rsvps.forEach(rsvp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(rsvp.name)}</td>
      <td><span style="color:${rsvp.attendance === 'Confirmado' ? '#4ade80' : '#f87171'};">${rsvp.attendance}</span></td>
      <td style="text-align:center;">${rsvp.companions} ${rsvp.companionNames ? `(${escapeHTML(rsvp.companionNames)})` : ''}</td>
      <td><a href="https://wa.me/55${rsvp.whatsapp.replace(/\D/g, '')}" target="_blank" style="color:var(--gold); text-decoration:none;">${escapeHTML(rsvp.whatsapp)}</a></td>
      <td>${escapeHTML(rsvp.email)}</td>
      <td style="font-size:0.95rem; font-style:italic; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(rsvp.message)}">${escapeHTML(rsvp.message) || '-'}</td>
    `;
    guestListRows.appendChild(row);
  });
}

// Utilitário para sanitizar HTML
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Exportar CSV
btnExportCsv.addEventListener("click", () => {
  const rsvps = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
  if (rsvps.length === 0) {
    alert("Não há dados locais para exportar.");
    return;
  }

  let csvContent = "\uFEFFNome;Presenca;Acompanhantes;NomesAcompanhantes;WhatsApp;Email;Mensagem;DataConfirmacao\n";
  rsvps.forEach(rsvp => {
    const name = rsvp.name.replace(/;/g, ",");
    const email = rsvp.email.replace(/;/g, ",");
    const whatsapp = rsvp.whatsapp.replace(/;/g, ",");
    const compsNames = (rsvp.companionNames || "").replace(/;/g, ",");
    const msg = (rsvp.message || "").replace(/;/g, ",").replace(/\n/g, " ");
    csvContent += `"${name}";"${rsvp.attendance}";${rsvp.companions};"${compsNames}";"${whatsapp}";"${email}";"${msg}";"${rsvp.date}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `confirmacoes_casamento_fabio_michele.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Limpar lista RSVP
btnClearRsvp.addEventListener("click", () => {
  if (confirm(currentLanguage === 'en' ? "Are you sure you want to clear test RSVPs?" : "Deseja mesmo limpar as confirmações de testes locais?")) {
    localStorage.removeItem("wedding_rsvps");
    renderGuestList();
  }
});

// Fechar modais ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target === giftModal) {
    giftModal.classList.remove("active");
  }
  if (e.target === adminModal) {
    adminModal.classList.remove("active");
  }
});

/*
=================================================================================
CÓDIGO ATUALIZADO DO GOOGLE APPS SCRIPT (ADICIONADA A COLUNA DE NOMES DE ACOMPANHANTES)
=================================================================================

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
*/
