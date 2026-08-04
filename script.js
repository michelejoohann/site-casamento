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
const guestSlotsGroup = document.getElementById("guest-slots-group");
const guestSlotsContainer = document.getElementById("guest-slots-container");
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
    searchSuccess: "Olá, {name}! Convite localizado. Confirme sua presença.",
    searchSuccessIndividual: "Olá, {name}! Convite localizado. Confirme sua presença.",
    searchTooShort: "Por favor, digite pelo menos 3 letras para realizar a busca.",
    searchAlreadyConfirmed: "⚠️ Atenção: Este convite já foi confirmado anteriormente. Se você enviar novamente, os novos dados substituirão os anteriores.",
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
    searchSuccess: "Hello, {name}! Invitation found. Please confirm your attendance.",
    searchSuccessIndividual: "Hello, {name}! Invitation found. Please confirm your attendance.",
    searchTooShort: "Please type at least 3 letters to search.",
    searchAlreadyConfirmed: "⚠️ Notice: This invitation has already been confirmed. Submitting again will overwrite the previous confirmation.",
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
  
  // Atualiza as traduções dos slots se estiverem desenhados
  document.querySelectorAll(".guest-slot-row").forEach((slot) => {
    const select = slot.querySelector(".guest-slot-select");
    const textInput = slot.querySelector(".guest-slot-name-input");
    
    if (select) {
      // Opção 0 (Default / Desabilitada)
      select.options[0].textContent = lang === "en" ? "-- Select option --" : "-- Selecione uma opção --";
      
      // Opção Acompanhante (penúltima)
      const optCompIndex = select.options.length - 2;
      select.options[optCompIndex].textContent = lang === "en" ? "Companion (Other name)" : "Acompanhante (Outro nome)";
      
      // Opção Ausente (última)
      const optAbsentIndex = select.options.length - 1;
      select.options[optAbsentIndex].textContent = lang === "en" ? "Will not attend" : "Não irá comparecer";
    }
    
    if (textInput) {
      textInput.placeholder = lang === "en" ? "Type companion full name" : "Digite o nome completo do acompanhante";
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
    
    // Checa se já foi confirmado anteriormente
    checkPreviousConfirmation(matchedName);

    // Configura os slots de confirmação individuais dos membros
    const guestNames = parseGuestNames(matchedName);
    buildGuestSlots(guestNames, matchedLimit);

    // Abre o formulário
    rsvpFields.style.display = "block";
    guestSlotsGroup.style.display = matchedLimit > 0 ? "block" : "none";
  } else {
    // Mensagem de erro
    validationMsg.innerHTML = `<span style="color: #f87171;">${translations[currentLanguage].searchError}</span>`;
    rsvpFields.style.display = "none";
    validatedGuestName = "";
    validatedLimit = 0;
  }
}

// Checa se o convidado já confirmou presença (no Google Sheets ou localmente)
function checkPreviousConfirmation(guestName) {
  const normalizedGuest = normalizeText(guestName);
  
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    // Busca na planilha do Google (GET)
    const checkUrl = `${GOOGLE_SHEET_URL}?name=${encodeURIComponent(guestName)}`;
    fetch(checkUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.found) {
          showAlreadyConfirmedWarning();
        }
      })
      .catch(err => console.log("Consulta de confirmação anterior silenciada:", err));
  } else {
    // Busca no localStorage local
    const localRSVPs = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
    const alreadyConfirmed = localRSVPs.some(rsvp => normalizeText(rsvp.name) === normalizedGuest);
    if (alreadyConfirmed) {
      showAlreadyConfirmedWarning();
    }
  }
}

// Mostra o card de aviso de sobrescrita
function showAlreadyConfirmedWarning() {
  const warningEl = document.createElement("div");
  warningEl.style.marginTop = "0.8rem";
  warningEl.style.color = "#fbbf24";
  warningEl.style.fontSize = "0.95rem";
  warningEl.style.fontWeight = "600";
  warningEl.style.lineHeight = "1.4";
  warningEl.style.border = "1px solid rgba(251, 191, 36, 0.25)";
  warningEl.style.background = "rgba(251, 191, 36, 0.05)";
  warningEl.style.padding = "0.8rem";
  warningEl.style.borderRadius = "8px";
  warningEl.style.textAlign = "left";
  warningEl.style.animation = "fadeInUp 0.3s ease";
  warningEl.innerHTML = translations[currentLanguage].searchAlreadyConfirmed;
  validationMsg.appendChild(warningEl);
}

// Extrai os nomes individuais de um convite composto (ex: "Dani, Jardel, Livia, Alice e acompanhantes")
function parseGuestNames(invitationName) {
  let cleanName = invitationName.replace(/\s+(e|and|&)\s+/ig, ", ");
  let parts = cleanName.split(",");
  
  let names = [];
  const wordsToIgnore = ["acompanhante", "acompanhantes", "familia", "convidado", "convidados", "filhos", "filho", "filha", "filhas"];
  
  parts.forEach(p => {
    let trimmed = p.trim();
    if (!trimmed) return;
    
    const lower = trimmed.toLowerCase();
    let shouldIgnore = false;
    for (let word of wordsToIgnore) {
      if (lower === word || lower.startsWith(word)) {
        shouldIgnore = true;
        break;
      }
    }
    
    if (!shouldIgnore && trimmed.length > 1) {
      names.push(trimmed);
    }
  });
  
  return names;
}

// Constrói dinamicamente os slots de seleção para cada convidado da lista
function buildGuestSlots(names, limit) {
  guestSlotsContainer.innerHTML = "";
  
  // Vagas totais = 1 principal + limite de acompanhantes
  const totalSpots = 1 + limit;
  
  for (let i = 0; i < totalSpots; i++) {
    const slotRow = document.createElement("div");
    slotRow.className = "guest-slot-row";
    
    const labelTextPt = `Convidado ${i + 1}`;
    const labelTextEn = `Guest ${i + 1}`;
    
    const header = document.createElement("div");
    header.className = "guest-slot-header";
    header.innerHTML = `
      <span class="guest-slot-label">
        <span class="lang-pt">${labelTextPt}</span>
        <span class="lang-en">${labelTextEn}</span>
      </span>
    `;
    slotRow.appendChild(header);
    
    const inputsDiv = document.createElement("div");
    inputsDiv.className = "guest-slot-inputs";
    
    const select = document.createElement("select");
    select.className = "form-control guest-slot-select";
    select.required = true;
    
    // Opção default
    const optDefault = document.createElement("option");
    optDefault.value = "";
    optDefault.disabled = true;
    optDefault.textContent = currentLanguage === "en" ? "-- Select option --" : "-- Selecione uma opção --";
    select.appendChild(optDefault);
    
    // Nomes identificados no convite
    names.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
    
    // Opção Acompanhante avulso
    const optCompanion = document.createElement("option");
    optCompanion.value = "Acompanhante";
    optCompanion.textContent = currentLanguage === "en" ? "Companion (Other name)" : "Acompanhante (Outro nome)";
    select.appendChild(optCompanion);
    
    // Opção Ausente
    const optAbsent = document.createElement("option");
    optAbsent.value = "Ausente";
    optAbsent.textContent = currentLanguage === "en" ? "Will not attend" : "Não irá comparecer";
    select.appendChild(optAbsent);
    
    inputsDiv.appendChild(select);
    
    // Input de texto para o nome do acompanhante caso selecionado
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "form-control guest-slot-name-input";
    textInput.style.display = "none";
    textInput.placeholder = currentLanguage === "en" ? "Type companion full name" : "Digite o nome completo do acompanhante";
    inputsDiv.appendChild(textInput);
    
    slotRow.appendChild(inputsDiv);
    guestSlotsContainer.appendChild(slotRow);
    
    // Pré-seleção inteligente
    if (i < names.length) {
      select.value = names[i];
    } else {
      select.value = "Ausente";
    }
    
    // Lógica para exibir input de texto ao selecionar Acompanhante
    select.addEventListener("change", () => {
      if (select.value === "Acompanhante") {
        textInput.style.display = "block";
        textInput.required = true;
      } else {
        textInput.style.display = "none";
        textInput.required = false;
        textInput.value = "";
      }
    });
    
    select.dispatchEvent(new Event("change"));
  }
}

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
    guestSlotsContainer.innerHTML = "";
    guestSlotsGroup.style.display = "none";
  }
});

// Máscara e formatação para o campo WhatsApp / Celular
const whatsappInput = document.getElementById("whatsapp");
whatsappInput.addEventListener("input", (e) => {
  let value = e.target.value;
  
  // Se começar com "+", trata como internacional e permite formato livre com hífens e parênteses
  if (value.startsWith("+")) {
    let plus = "+";
    let rest = value.substring(1).replace(/[^\d\s\-\(\)]/g, "");
    e.target.value = (plus + rest).substring(0, 18);
    return;
  }
  
  // Caso contrário, aplica a máscara padrão brasileira (DDD + 9 ou 8 dígitos)
  let digits = value.replace(/\D/g, "");
  digits = digits.substring(0, 11); // Limita a 11 dígitos
  
  if (digits.length === 0) {
    e.target.value = "";
  } else if (digits.length <= 2) {
    e.target.value = `(${digits}`;
  } else if (digits.length <= 6) {
    e.target.value = `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  } else if (digits.length <= 10) {
    e.target.value = `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  } else {
    e.target.value = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
});

// Esconder slots caso a resposta seja 'Ausente'
radioAttendance.forEach(radio => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "Ausente") {
      guestSlotsGroup.style.display = "none";
    } else {
      if (validatedLimit > 0) {
        guestSlotsGroup.style.display = "block";
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
  let attendance = document.querySelector('input[name="attendance"]:checked').value;
  
  let totalConfirmed = 0;
  let namesConfirmed = "";
  
  if (attendance === "Confirmado") {
    if (validatedLimit > 0) {
      const slotRows = document.querySelectorAll(".guest-slot-row");
      const confirmedNames = [];
      
      slotRows.forEach(slot => {
        const select = slot.querySelector(".guest-slot-select");
        const textInput = slot.querySelector(".guest-slot-name-input");
        const selectVal = select.value;
        
        if (selectVal && selectVal !== "Ausente") {
          if (selectVal === "Acompanhante") {
            const typedName = textInput.value.trim();
            if (typedName) confirmedNames.push(typedName);
          } else {
            confirmedNames.push(selectVal);
          }
        }
      });
      
      if (confirmedNames.length > 0) {
        totalConfirmed = confirmedNames.length;
        namesConfirmed = confirmedNames.join(", ");
      } else {
        // Se todos os slots do convite familiar forem ausentes, a presença geral é Ausente
        attendance = "Ausente";
      }
    } else {
      // Convite individual
      totalConfirmed = 1;
      namesConfirmed = name;
    }
  }

  const rsvpData = {
    name,
    email,
    whatsapp,
    attendance,
    companions: totalConfirmed,
    companionNames: namesConfirmed || "", // Enviado ao Google Sheets
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
    // Fallback local (localStorage) - Sobrescreve se já existir
    let currentRSVPs = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
    const normalizedNew = normalizeText(rsvpData.name);
    const existingIndex = currentRSVPs.findIndex(rsvp => normalizeText(rsvp.name) === normalizedNew);

    if (existingIndex !== -1) {
      currentRSVPs[existingIndex] = rsvpData; // Sobrescreve o anterior
    } else {
      currentRSVPs.push(rsvpData); // Adiciona novo
    }
    
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
  guestSlotsContainer.innerHTML = "";
  guestSlotsGroup.style.display = "none";
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

  let csvContent = "\uFEFFNome;Presenca;TotalConfirmados;NomesConfirmados;WhatsApp;Email;Mensagem;DataConfirmacao\n";
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
CÓDIGO ATUALIZADO DO GOOGLE APPS SCRIPT (COM SOBRESCRITA E SUPORTE A BUSCA GET)
=================================================================================

// 1. Processa requisições POST para salvar/atualizar confirmações
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var nameToFind = data.name;
    var sheetData = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    var normalize = function(text) {
      return text.toString().trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    var normalizedSearch = normalize(nameToFind);
    
    // Procura se já existe uma confirmação com esse nome para sobrescrever
    for (var i = 1; i < sheetData.length; i++) {
      var rowName = sheetData[i][0]; // Coluna A (Nome)
      if (normalize(rowName) === normalizedSearch) {
        rowIndex = i + 1; // Google Sheets é 1-indexed
        break;
      }
    }
    
    var rowData = [
      data.name,
      data.email,
      data.whatsapp,
      data.attendance,
      data.companions,
      data.companionNames || "",
      data.message,
      data.date || new Date().toLocaleString("pt-BR")
    ];
    
    if (rowIndex !== -1) {
      // Sobrescreve a linha do convidado existente
      var range = sheet.getRange(rowIndex, 1, 1, rowData.length);
      range.setValues([rowData]);
    } else {
      // Adiciona uma nova linha se for inédito
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Processa requisições GET para checar se um convidado já confirmou
function doGet(e) {
  try {
    var nameToFind = e.parameter.name;
    if (!nameToFind) {
      return ContentService.createTextOutput(JSON.stringify({ "found": false }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var sheetData = sheet.getDataRange().getValues();
    var found = false;
    
    var normalize = function(text) {
      return text.toString().trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    var normalizedSearch = normalize(nameToFind);
    
    for (var i = 1; i < sheetData.length; i++) {
      var rowName = sheetData[i][0]; // Coluna A (Nome)
      if (normalize(rowName) === normalizedSearch) {
        found = true;
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "found": found }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "found": false, "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
