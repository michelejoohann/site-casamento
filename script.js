// CONFIGURAÇÕES DO CASAMENTO
// As configurações sensíveis (GOOGLE_SHEET_URL e ADMIN_PASSWORD) foram movidas para o arquivo privado 'config.js'.
// Caso ele não esteja presente (por exemplo, no ambiente do GitHub Pages), usamos variáveis vazias ou padrão.
const GOOGLE_SHEET_URL = typeof CONFIG !== "undefined" ? CONFIG.GOOGLE_SHEET_URL : "SUA_URL_DO_GOOGLE_SCRIPT_AQUI";
const ADMIN_PASSWORD = typeof CONFIG !== "undefined" ? CONFIG.ADMIN_PASSWORD : "beren";

const CASAMENTO_DATE = new Date("2027-09-21T16:00:00").getTime(); // 21 de Setembro de 2027, 16:00h

// 2. LISTA OFICIAL DE CONVIDADOS E LIMITE DE ACOMPANHANTES
// Chave: Nome exato do convidado principal (como você enviará no convite).
// Valor: Limite máximo de acompanhantes que essa pessoa pode levar (0 significa individual).
// O sistema é inteligente: ele ignora acentos, maiúsculas/minúsculas e espaços extras ao validar.
const GUEST_LIST = {};

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
    searchError: "Não encontramos esse nome em nossa lista de convidados. Por favor, verifique a grafia ou tente buscar pelo nome principal do convite de sua família. Se precisar de ajuda, fale com os noivos! 🌿",
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
    searchError: "We couldn't find this name in our guest list. Please check the spelling or try searching by the primary name on your family's invitation. If you need help, please contact the couple! 🌿",
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

// =========================================
// 3.5. MODAL DE GUIA DE TRAJES E ABAS
// =========================================
const attireModal = document.getElementById("attire-modal");
const btnOpenAttireModal = document.getElementById("btn-open-attire-modal");
const closeAttireModal = document.getElementById("close-attire-modal");

const tabFemBtn = document.getElementById("tab-fem-btn");
const tabMascBtn = document.getElementById("tab-masc-btn");
const tabClimaBtn = document.getElementById("tab-clima-btn");
const tabFemContent = document.getElementById("tab-fem-content");
const tabMascContent = document.getElementById("tab-masc-content");
const tabClimaContent = document.getElementById("tab-clima-content");

// LIGHTBOX
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const closeLightboxModal = document.getElementById("close-lightbox-modal");

function selectAttireTab(tab) {
  if (tab === "fem") {
    tabFemBtn.classList.add("active");
    tabMascBtn.classList.remove("active");
    tabClimaBtn.classList.remove("active");
    tabFemContent.classList.add("active");
    tabMascContent.classList.remove("active");
    tabClimaContent.classList.remove("active");
  } else if (tab === "masc") {
    tabFemBtn.classList.remove("active");
    tabMascBtn.classList.add("active");
    tabClimaBtn.classList.remove("active");
    tabFemContent.classList.remove("active");
    tabMascContent.classList.add("active");
    tabClimaContent.classList.remove("active");
  } else {
    tabFemBtn.classList.remove("active");
    tabMascBtn.classList.remove("active");
    tabClimaBtn.classList.add("active");
    tabFemContent.classList.remove("active");
    tabMascContent.classList.remove("active");
    tabClimaContent.classList.add("active");
  }
}

if (tabFemBtn) tabFemBtn.addEventListener("click", () => selectAttireTab("fem"));
if (tabMascBtn) tabMascBtn.addEventListener("click", () => selectAttireTab("masc"));
if (tabClimaBtn) tabClimaBtn.addEventListener("click", () => selectAttireTab("clima"));

if (btnOpenAttireModal) {
  btnOpenAttireModal.addEventListener("click", () => {
    selectAttireTab("fem");
    attireModal.classList.add("active");
  });
}

if (closeAttireModal) {
  closeAttireModal.addEventListener("click", () => {
    attireModal.classList.remove("active");
  });
}

const btnCloseAttireBottom = document.getElementById("btn-close-attire-bottom");
if (btnCloseAttireBottom) {
  btnCloseAttireBottom.addEventListener("click", () => {
    attireModal.classList.remove("active");
  });
}

// Abrir lightbox para zoom das imagens de referência
document.querySelectorAll(".attire-gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    const img = item.querySelector(".attire-gallery-img");
    const label = item.querySelector(".attire-gallery-label");
    
    const activeSpan = label.querySelector(`.lang-${currentLanguage}`);
    const captionText = activeSpan ? activeSpan.textContent : label.textContent;

    lightboxImg.src = img.src;
    lightboxCaption.textContent = captionText;
    lightboxModal.classList.add("active");
  });
});

if (closeLightboxModal) {
  closeLightboxModal.addEventListener("click", () => {
    lightboxModal.classList.remove("active");
  });
}

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

// Obtém lista combinada de convidados (estática + personalizada local)
function getCombinedGuestList() {
  const customGuests = JSON.parse(localStorage.getItem("wedding_custom_guests")) || {};
  const combined = { ...GUEST_LIST };
  for (let name in customGuests) {
    const guestData = customGuests[name];
    if (typeof guestData === 'object' && guestData !== null) {
      combined[name] = guestData.limit;
    } else {
      combined[name] = guestData; // Fallback de migração caso existisse número puro
    }
  }
  return combined;
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

  const combinedList = getCombinedGuestList();
  let matchedName = "";
  let matchedLimit = 0;
  let found = false;

  // 1. Tenta correspondência exata primeiro
  for (let guest in combinedList) {
    if (normalizeText(guest) === normalizedTyped) {
      matchedName = guest;
      matchedLimit = combinedList[guest];
      found = true;
      break;
    }
  }

  // 2. Se não encontrou exato, tenta correspondência parcial (se o nome na lista contiver o termo digitado)
  if (!found) {
    for (let guest in combinedList) {
      if (normalizeText(guest).includes(normalizedTyped)) {
        matchedName = guest;
        matchedLimit = combinedList[guest];
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
    const isGroup = guestNames.length > 1 || matchedLimit > 0;
    guestSlotsGroup.style.display = isGroup ? "block" : "none";
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
  
  // Vagas totais = Nomes identificados + limite de acompanhantes
  const totalSpots = names.length + limit;
  
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
      const guestNames = parseGuestNames(validatedGuestName);
      const isGroup = guestNames.length > 1 || validatedLimit > 0;
      if (isGroup) {
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
  
  const guestNames = parseGuestNames(name);
  const isGroup = guestNames.length > 1 || validatedLimit > 0;

  if (attendance === "Confirmado") {
    if (isGroup) {
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
  // Carga em segundo plano (background) da lista de convidados cadastrados na planilha do Google Drive
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    fetch(`${GOOGLE_SHEET_URL}?action=loadGuests`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          localStorage.setItem("wedding_custom_guests", JSON.stringify(data));
          // Re-executa a busca por parâmetro se houver, agora com a lista atualizada
          const urlParams = new URLSearchParams(window.location.search);
          const guestParam = urlParams.get("g") || urlParams.get("convidado") || urlParams.get("guest");
          if (guestParam) {
            inputName.value = decodeURIComponent(guestParam);
            searchInvitation();
          }
        }
      })
      .catch(err => console.error("Erro ao carregar convidados do Google Drive:", err));
  }

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
let editingVendorIndex = null;
let editingExpenseIndex = null;
let editingNoteIndex = null;

// Elementos de formulário e botões de bastidores
const btnSubmitVendor = document.getElementById("btn-submit-vendor");
const btnCancelEditVendor = document.getElementById("btn-cancel-edit-vendor");
const btnSubmitExpense = document.getElementById("btn-submit-expense");
const btnCancelEditExpense = document.getElementById("btn-cancel-edit-expense");
const btnSubmitNote = document.getElementById("btn-submit-note");
const btnCancelEditNote = document.getElementById("btn-cancel-edit-note");

// O painel administrativo local está sempre disponível via botão flutuante e no rodapé do site
// (a verificação do GOOGLE_SHEET_URL foi removida para garantir o acesso aos controles de bastidores)

// Abrir modal admin
adminBtn.addEventListener("click", () => {
  adminModal.classList.add("active");
  adminPassInput.value = "";
  
  if (isAdminAuthenticated) {
    adminAuthSection.style.display = "none";
    adminDataSection.style.display = "block";
    initializeAdminDashboard();
    selectAdminTab("rsvp");
  } else {
    adminAuthSection.style.display = "block";
    adminDataSection.style.display = "none";
  }
});

// Abrir modal admin via links do rodapé
document.querySelectorAll(".admin-trigger-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    adminBtn.click();
  });
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
    syncFromGoogleSheets();
  } else {
    alert(currentLanguage === 'en' ? "Incorrect password!" : "Senha incorreta!");
    adminPassInput.value = "";
  }
}

// Renderizar Lista de Convidados
function renderGuestList() {
  const rsvps = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
  guestListRows.innerHTML = "";

  let confirmedCount = 0;
  let absentCount = 0;
  let totalCount = rsvps.length;

  if (rsvps.length === 0) {
    guestListRows.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver);">${currentLanguage === 'en' ? 'No confirmations received yet.' : 'Nenhuma confirmação recebida ainda.'}</td></tr>`;
    updateRsvpTotalizers(0, 0, 0);
    return;
  }

  rsvps.forEach(rsvp => {
    const peopleInName = Math.max(1, parseGuestNames(rsvp.name).length);
    if (rsvp.attendance === "Confirmado") {
      confirmedCount += parseInt(rsvp.companions) || 1;
    } else {
      absentCount += peopleInName;
    }

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

  updateRsvpTotalizers(confirmedCount, absentCount, totalCount);
}

function updateRsvpTotalizers(confirmed, absent, total) {
  const elConfirmed = document.getElementById("val-rsvp-confirmed");
  const elAbsent = document.getElementById("val-rsvp-absent");
  const elTotal = document.getElementById("val-rsvp-total");
  if (elConfirmed) elConfirmed.textContent = confirmed;
  if (elAbsent) elAbsent.textContent = absent;
  if (elTotal) elTotal.textContent = total;
}

// Utilitário para sanitizar HTML
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s.replace(/[&<>'"]/g,
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
  link.setAttribute("download", `confirmacoes_casamento_michele_fabio.csv`);
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

// =================================================
// 5.5. LOGICA DOS BASTIDORES (DASHBOARD ADMINISTRATIVO)
// =================================================
const btnAdminTabRsvp = document.getElementById("btn-admin-tab-rsvp");
const btnAdminTabGuests = document.getElementById("btn-admin-tab-guests");
const btnAdminTabVendors = document.getElementById("btn-admin-tab-vendors");
const btnAdminTabBudget = document.getElementById("btn-admin-tab-budget");
const btnAdminTabNotes = document.getElementById("btn-admin-tab-notes");

const adminPanelRsvp = document.getElementById("admin-panel-rsvp");
const adminPanelGuests = document.getElementById("admin-panel-guests");
const adminPanelVendors = document.getElementById("admin-panel-vendors");
const adminPanelBudget = document.getElementById("admin-panel-budget");
const adminPanelNotes = document.getElementById("admin-panel-notes");

const formAddGuest = document.getElementById("form-add-guest");
const formAddVendor = document.getElementById("form-add-vendor");
const formAddExpense = document.getElementById("form-add-expense");
const formAddNote = document.getElementById("form-add-note");
const btnExportBudgetCsv = document.getElementById("btn-export-budget-csv");
const notesCardsContainer = document.getElementById("notes-cards-container");

const btnCancelEditGuest = document.getElementById("btn-cancel-edit-guest");
const btnSubmitGuest = document.getElementById("btn-submit-guest");

let editingGuestName = null; // Guarda o nome do convidado sendo editado

const adminTabButtons = {
  rsvp: btnAdminTabRsvp,
  guests: btnAdminTabGuests,
  vendors: btnAdminTabVendors,
  budget: btnAdminTabBudget,
  notes: btnAdminTabNotes
};

const adminTabPanels = {
  rsvp: adminPanelRsvp,
  guests: adminPanelGuests,
  vendors: adminPanelVendors,
  budget: adminPanelBudget,
  notes: adminPanelNotes
};

function selectAdminTab(tabName) {
  for (let key in adminTabButtons) {
    if (!adminTabButtons[key]) continue;
    if (key === tabName) {
      adminTabButtons[key].classList.add("active");
      adminTabPanels[key].style.display = "block";
    } else {
      adminTabButtons[key].classList.remove("active");
      adminTabPanels[key].style.display = "none";
    }
  }
}

if (btnAdminTabRsvp) btnAdminTabRsvp.addEventListener("click", () => selectAdminTab("rsvp"));
if (btnAdminTabGuests) btnAdminTabGuests.addEventListener("click", () => selectAdminTab("guests"));
if (btnAdminTabVendors) btnAdminTabVendors.addEventListener("click", () => selectAdminTab("vendors"));
if (btnAdminTabBudget) btnAdminTabBudget.addEventListener("click", () => selectAdminTab("budget"));
if (btnAdminTabNotes) btnAdminTabNotes.addEventListener("click", () => selectAdminTab("notes"));

// Inicializar dados padrão se não existirem
function initializeAdminDashboard() {
  if (!localStorage.getItem("wedding_custom_guests")) {
    localStorage.setItem("wedding_custom_guests", JSON.stringify({}));
  }
  if (!localStorage.getItem("wedding_vendors")) {
    const defaultVendors = [
      { name: "Salão Rivendell", category: "Local", contact: "(51) 98765-4321", status: "Contratado", notes: "Local da cerimônia ao ar livre" },
      { name: "Banquetes do Condado", category: "Buffet", contact: "(51) 98888-7777", status: "Orçado", notes: "Menu completo com churrasco gaúcho" }
    ];
    localStorage.setItem("wedding_vendors", JSON.stringify(defaultVendors));
  }
  if (!localStorage.getItem("wedding_expenses")) {
    const defaultExpenses = [
      { name: "Aluguel do Espaço", vendor: "Salão Rivendell", budgeted: 15000.00, paid: 5000.00, payer: "Noivos (Juntos)", date: "01/08/2026", method: "Transferência" },
      { name: "Buffet Completo", vendor: "Banquetes do Condado", budgeted: 12000.00, paid: 0.00, payer: "Pendente", date: "", method: "N/A" }
    ];
    localStorage.setItem("wedding_expenses", JSON.stringify(defaultExpenses));
  }
  const existingNotes = JSON.parse(localStorage.getItem("wedding_notes")) || [];
  if (existingNotes.length === 0) {
    const defaultNotes = [
      { title: "Cerimônia do Handfasting Élfico", category: "Rito", content: "Tradição celta e medieval onde as mãos dos noivos são atadas com fitas ou cordões dourados e prateados durante os votos, simbolizando a união física e espiritual (como Beren e Lúthien)." },
      { title: "O Ritmo das Estações (Equinócio)", category: "Tradição", content: "Como o casamento será no equinócio de primavera, faremos uma homenagem com pétalas de flores coloridas da estação ou plantio de uma muda de árvore de folhas verdes em um vaso comum durante a cerimônia." },
      { title: "Entrada com a Música Tema Instrumental", category: "Ideia", content: "Tocar a melodia da música tema (Balada de Beren e Lúthien) com violino e violão acústico na entrada da noiva para criar uma atmosfera de floresta mágica." },
      { title: "Iluminação de Lórien", category: "Ideia", content: "Decorar a árvore principal do altar com luzes de fada suspensas (fairy lights) e lamparinas douradas simulando a floresta de Lothlórien." }
    ];
    localStorage.setItem("wedding_notes", JSON.stringify(defaultNotes));
    saveToGoogleSheets();
  }

  // Renderizar todas as seções
  renderGuestList();
  renderInvitedGuests();
  renderVendors();
  renderExpenses();
  renderNotes();
}

function renderInvitedGuests() {
  const customGuests = JSON.parse(localStorage.getItem("wedding_custom_guests")) || {};
  const invitedRows = document.getElementById("invited-list-rows");
  if (!invitedRows) return;
  invitedRows.innerHTML = "";

  let totalInvites = 0;
  let totalCapacity = 0;

  // Mostrar lista fixa estática
  for (let name in GUEST_LIST) {
    totalInvites++;
    const nameCount = Math.max(1, parseGuestNames(name).length);
    totalCapacity += nameCount + (parseInt(GUEST_LIST[name]) || 0);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(name)}</td>
      <td style="text-align:center;">${GUEST_LIST[name]}</td>
      <td style="text-align:center;"><span class="badge-status orcado">Ambos</span></td>
      <td><span class="badge-status orcado" style="border-color: rgba(255, 255, 255, 0.1); color: var(--silver);">Lista Inicial</span></td>
      <td>-</td>
    `;
    invitedRows.appendChild(row);
  }

  // Mostrar convidados dinâmicos cadastrados
  for (let name in customGuests) {
    const guestData = customGuests[name];
    const limit = typeof guestData === 'object' ? (parseInt(guestData.limit) || 0) : (parseInt(guestData) || 0);
    const side = typeof guestData === 'object' ? (guestData.side || "Ambos") : "Ambos";

    totalInvites++;
    const nameCount = Math.max(1, parseGuestNames(name).length);
    totalCapacity += nameCount + limit;

    let sideBadgeClass = "orcado"; // Ambos
    if (side === "Noiva") sideBadgeClass = "concluido"; // verde
    if (side === "Noivo") sideBadgeClass = "contratado"; // azul

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(name)}</td>
      <td style="text-align:center;">${limit}</td>
      <td style="text-align:center;"><span class="badge-status ${sideBadgeClass}">${escapeHTML(side)}</span></td>
      <td><span class="badge-status concluido">Painel</span></td>
      <td>
        <button class="btn-elf btn-edit-custom-guest" data-name="${encodeURIComponent(name)}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">Editar</button>
        <button class="btn-delete-row btn-delete-custom-guest" data-name="${encodeURIComponent(name)}">Excluir</button>
      </td>
    `;
    invitedRows.appendChild(row);
  }

  updateInvitesTotalizers(totalInvites, totalCapacity);
}

function updateInvitesTotalizers(count, capacity) {
  const elCount = document.getElementById("val-invites-count");
  const elCapacity = document.getElementById("val-invites-capacity");
  if (elCount) elCount.textContent = count;
  if (elCapacity) elCapacity.textContent = capacity;
}

function renderVendors() {
  const vendors = JSON.parse(localStorage.getItem("wedding_vendors")) || [];
  const vendorRows = document.getElementById("vendor-list-rows");
  if (!vendorRows) return;
  vendorRows.innerHTML = "";

  if (vendors.length === 0) {
    vendorRows.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver);">Nenhum fornecedor cadastrado.</td></tr>`;
    return;
  }

  vendors.forEach((vendor, index) => {
    let statusClass = "orcado";
    if (vendor.status === "Pendente") statusClass = "pendente";
    if (vendor.status === "Contratado") statusClass = "contratado";
    if (vendor.status === "Concluído" || vendor.status === "Concluido") statusClass = "concluido";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(vendor.name)}</td>
      <td>${escapeHTML(vendor.category)}</td>
      <td>${escapeHTML(vendor.contact)}</td>
      <td><span class="badge-status ${statusClass}">${escapeHTML(vendor.status)}</span></td>
      <td style="font-size:0.95rem; font-style:italic;">${escapeHTML(vendor.notes) || '-'}</td>
      <td>
        <button class="btn-elf btn-edit-vendor" data-index="${index}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">Editar</button>
        <button class="btn-delete-row btn-delete-vendor" data-index="${index}">Excluir</button>
      </td>
    `;
    vendorRows.appendChild(row);
  });
}

function renderExpenses() {
  const expenses = JSON.parse(localStorage.getItem("wedding_expenses")) || [];
  const expenseRows = document.getElementById("expense-list-rows");
  if (!expenseRows) return;
  expenseRows.innerHTML = "";

  let totalBudgeted = 0;
  let totalPaid = 0;
  let totalPending = 0;

  if (expenses.length === 0) {
    expenseRows.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--silver);">Nenhuma despesa lançada.</td></tr>`;
    updateBudgetCards(0, 0, 0);
    return;
  }

  expenses.forEach((expense, index) => {
    const budgeted = parseFloat(expense.budgeted) || 0;
    const paid = parseFloat(expense.paid) || 0;
    const pending = budgeted - paid;

    totalBudgeted += budgeted;
    totalPaid += paid;
    totalPending += pending;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(expense.name)}</td>
      <td>${escapeHTML(expense.vendor)}</td>
      <td>${formatCurrency(budgeted)}</td>
      <td style="color:#4ade80;">${formatCurrency(paid)}</td>
      <td style="color:${pending > 0 ? '#f87171' : 'var(--silver)'};">${formatCurrency(pending)}</td>
      <td>${escapeHTML(expense.payer)}</td>
      <td>${escapeHTML(expense.date) || '-'}</td>
      <td>${escapeHTML(expense.method)}</td>
      <td>
        <button class="btn-elf btn-edit-expense" data-index="${index}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">Editar</button>
        <button class="btn-delete-row btn-delete-expense" data-index="${index}">Excluir</button>
      </td>
    `;
    expenseRows.appendChild(row);
  });

  updateBudgetCards(totalBudgeted, totalPaid, totalPending);
}

function formatCurrency(val) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateBudgetCards(budgeted, paid, pending) {
  const elBudgeted = document.getElementById("val-total-budgeted");
  const elPaid = document.getElementById("val-total-paid");
  const elPending = document.getElementById("val-total-pending");
  if (elBudgeted) elBudgeted.textContent = formatCurrency(budgeted);
  if (elPaid) elPaid.textContent = formatCurrency(paid);
  if (elPending) elPending.textContent = formatCurrency(pending);
}

// Funções de Deletar
function deleteCustomGuest(name) {
  if (confirm(`Deseja mesmo remover "${name}" da lista de convites?`)) {
    const customGuests = JSON.parse(localStorage.getItem("wedding_custom_guests")) || {};
    delete customGuests[name];
    localStorage.setItem("wedding_custom_guests", JSON.stringify(customGuests));
    saveToGoogleSheets();
    renderInvitedGuests();
  }
}

function deleteVendor(index) {
  const vendors = JSON.parse(localStorage.getItem("wedding_vendors")) || [];
  if (confirm(`Deseja mesmo remover o fornecedor "${vendors[index].name}"?`)) {
    vendors.splice(index, 1);
    localStorage.setItem("wedding_vendors", JSON.stringify(vendors));
    saveToGoogleSheets();
    renderVendors();
  }
}

function deleteExpense(index) {
  const expenses = JSON.parse(localStorage.getItem("wedding_expenses")) || [];
  if (confirm(`Deseja mesmo remover a despesa "${expenses[index].name}"?`)) {
    expenses.splice(index, 1);
    localStorage.setItem("wedding_expenses", JSON.stringify(expenses));
    saveToGoogleSheets();
    renderExpenses();
  }
}

// Event delegation para exclusões e edições (evita inline script no HTML)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete-custom-guest")) {
    const name = decodeURIComponent(e.target.getAttribute("data-name") || "");
    deleteCustomGuest(name);
  }
  if (e.target.classList.contains("btn-edit-custom-guest")) {
    const name = decodeURIComponent(e.target.getAttribute("data-name") || "");
    editCustomGuest(name);
  }
  if (e.target.classList.contains("btn-delete-vendor")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    deleteVendor(index);
  }
  if (e.target.classList.contains("btn-edit-vendor")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    editVendor(index);
  }
  if (e.target.classList.contains("btn-delete-expense")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    deleteExpense(index);
  }
  if (e.target.classList.contains("btn-edit-expense")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    editExpense(index);
  }
  if (e.target.classList.contains("btn-delete-note-item")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    deleteNote(index);
  }
  if (e.target.classList.contains("btn-edit-note-item")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    editNote(index);
  }
});

// Event Listeners dos Formulários
if (formAddGuest) {
  formAddGuest.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("admin-guest-name");
    const limitInput = document.getElementById("admin-guest-limit");
    const sideInput = document.getElementById("admin-guest-side");
    const name = nameInput.value.trim();
    const limit = parseInt(limitInput.value) || 0;
    const side = sideInput ? sideInput.value : "Ambos";

    if (!name) return;

    const customGuests = JSON.parse(localStorage.getItem("wedding_custom_guests")) || {};

    if (!editingGuestName) {
      // Cadastro Novo
      if (GUEST_LIST[name] !== undefined || customGuests[name] !== undefined) {
        alert("Este convidado já está na lista!");
        return;
      }
    } else {
      // Edição: se mudou o nome, remove o registro antigo
      if (editingGuestName !== name) {
        delete customGuests[editingGuestName];
      }
    }

    customGuests[name] = { limit: limit, side: side };
    localStorage.setItem("wedding_custom_guests", JSON.stringify(customGuests));
    saveToGoogleSheets();

    // Limpa estado de edição
    editingGuestName = null;
    if (btnSubmitGuest) btnSubmitGuest.textContent = "+ Adicionar";
    if (btnCancelEditGuest) btnCancelEditGuest.style.display = "none";

    formAddGuest.reset();
    renderInvitedGuests();
  });
}

function editCustomGuest(name) {
  const customGuests = JSON.parse(localStorage.getItem("wedding_custom_guests")) || {};
  const guestData = customGuests[name];
  if (guestData === undefined || guestData === null) return;

  editingGuestName = name;

  const limit = typeof guestData === 'object' ? guestData.limit : guestData;
  const side = typeof guestData === 'object' ? guestData.side : "Ambos";

  document.getElementById("admin-guest-name").value = name;
  document.getElementById("admin-guest-limit").value = limit;
  
  const elSide = document.getElementById("admin-guest-side");
  if (elSide) elSide.value = side;

  if (btnSubmitGuest) btnSubmitGuest.textContent = "Salvar";
  if (btnCancelEditGuest) btnCancelEditGuest.style.display = "block";

  const formEl = document.getElementById("form-add-guest");
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
}

if (btnCancelEditGuest) {
  btnCancelEditGuest.addEventListener("click", () => {
    editingGuestName = null;
    formAddGuest.reset();
    if (btnSubmitGuest) btnSubmitGuest.textContent = "+ Adicionar";
    btnCancelEditGuest.style.display = "none";
  });
}

if (formAddVendor) {
  formAddVendor.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("vendor-name").value.trim();
    const category = document.getElementById("vendor-category").value;
    const contact = document.getElementById("vendor-contact").value.trim();
    const status = document.getElementById("vendor-status").value;
    const notes = document.getElementById("vendor-notes").value.trim();

    const vendors = JSON.parse(localStorage.getItem("wedding_vendors")) || [];
    
    if (editingVendorIndex === null) {
      vendors.push({ name, category, contact, status, notes });
    } else {
      vendors[editingVendorIndex] = { name, category, contact, status, notes };
      editingVendorIndex = null;
      if (btnSubmitVendor) btnSubmitVendor.textContent = "+ Cadastrar";
      if (btnCancelEditVendor) btnCancelEditVendor.style.display = "none";
    }

    localStorage.setItem("wedding_vendors", JSON.stringify(vendors));
    saveToGoogleSheets();
    
    formAddVendor.reset();
    renderVendors();
  });
}

function editVendor(index) {
  const vendors = JSON.parse(localStorage.getItem("wedding_vendors")) || [];
  const vendor = vendors[index];
  if (!vendor) return;

  editingVendorIndex = index;

  document.getElementById("vendor-name").value = vendor.name;
  document.getElementById("vendor-category").value = vendor.category;
  document.getElementById("vendor-contact").value = vendor.contact;
  document.getElementById("vendor-status").value = vendor.status;
  document.getElementById("vendor-notes").value = vendor.notes || "";

  if (btnSubmitVendor) btnSubmitVendor.textContent = "Salvar";
  if (btnCancelEditVendor) btnCancelEditVendor.style.display = "block";

  const formEl = document.getElementById("form-add-vendor");
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
}

if (btnCancelEditVendor) {
  btnCancelEditVendor.addEventListener("click", () => {
    editingVendorIndex = null;
    formAddVendor.reset();
    if (btnSubmitVendor) btnSubmitVendor.textContent = "+ Cadastrar";
    btnCancelEditVendor.style.display = "none";
  });
}

if (formAddExpense) {
  formAddExpense.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("expense-name").value.trim();
    const vendor = document.getElementById("expense-vendor").value.trim();
    const budgeted = parseFloat(document.getElementById("expense-budgeted").value) || 0;
    const paid = parseFloat(document.getElementById("expense-paid").value) || 0;
    const payer = document.getElementById("expense-payer").value;
    const date = document.getElementById("expense-date").value.trim();
    const method = document.getElementById("expense-method").value;

    const expenses = JSON.parse(localStorage.getItem("wedding_expenses")) || [];
    
    if (editingExpenseIndex === null) {
      expenses.push({ name, vendor, budgeted, paid, payer, date, method });
    } else {
      expenses[editingExpenseIndex] = { name, vendor, budgeted, paid, payer, date, method };
      editingExpenseIndex = null;
      if (btnSubmitExpense) btnSubmitExpense.textContent = "+ Lançar";
      if (btnCancelEditExpense) btnCancelEditExpense.style.display = "none";
    }

    localStorage.setItem("wedding_expenses", JSON.stringify(expenses));
    saveToGoogleSheets();

    formAddExpense.reset();
    renderExpenses();
  });
}

function editExpense(index) {
  const expenses = JSON.parse(localStorage.getItem("wedding_expenses")) || [];
  const expense = expenses[index];
  if (!expense) return;

  editingExpenseIndex = index;

  document.getElementById("expense-name").value = expense.name;
  document.getElementById("expense-vendor").value = expense.vendor;
  document.getElementById("expense-budgeted").value = expense.budgeted;
  document.getElementById("expense-paid").value = expense.paid;
  document.getElementById("expense-payer").value = expense.payer;
  document.getElementById("expense-date").value = expense.date || "";
  document.getElementById("expense-method").value = expense.method;

  if (btnSubmitExpense) btnSubmitExpense.textContent = "Salvar";
  if (btnCancelEditExpense) btnCancelEditExpense.style.display = "block";

  const formEl = document.getElementById("form-add-expense");
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
}

if (btnCancelEditExpense) {
  btnCancelEditExpense.addEventListener("click", () => {
    editingExpenseIndex = null;
    formAddExpense.reset();
    if (btnSubmitExpense) btnSubmitExpense.textContent = "+ Lançar";
    btnCancelEditExpense.style.display = "none";
  });
}

// Exportar Planilha de Custos para CSV
if (btnExportBudgetCsv) {
  btnExportBudgetCsv.addEventListener("click", () => {
    const expenses = JSON.parse(localStorage.getItem("wedding_expenses")) || [];
    if (expenses.length === 0) {
      alert("Não há dados de despesas para exportar.");
      return;
    }

    let csvContent = "\uFEFFItem;Fornecedor;Orcado;Pago;Pendente;Payer;Data;Forma\n";
    expenses.forEach(exp => {
      const name = exp.name.replace(/;/g, ",");
      const vendor = exp.vendor.replace(/;/g, ",");
      const budgeted = exp.budgeted;
      const paid = exp.paid;
      const pending = budgeted - paid;
      const payer = exp.payer;
      const date = exp.date || "";
      const method = exp.method;
      
      csvContent += `"${name}";"${vendor}";${budgeted};${paid};${pending};"${payer}";"${date}";"${method}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `controle_financeiro_casamento.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Filtro de pesquisa em tempo real na lista de convites
const searchInvitedInput = document.getElementById("search-invited-guests");
if (searchInvitedInput) {
  searchInvitedInput.addEventListener("input", (e) => {
    const term = normalizeText(e.target.value);
    const rows = document.querySelectorAll("#invited-list-rows tr");
    rows.forEach(row => {
      const nameCell = row.querySelector("td");
      if (nameCell) {
        const nameText = normalizeText(nameCell.textContent);
        if (nameText.includes(term)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    });
  });
}

// Renderizar Notas/Ideias de Ritos e Tradições
function renderNotes() {
  const notes = JSON.parse(localStorage.getItem("wedding_notes")) || [];
  if (!notesCardsContainer) return;
  notesCardsContainer.innerHTML = "";

  if (notes.length === 0) {
    notesCardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--silver); padding: 2rem 0;">Nenhuma nota ou ideia cadastrada ainda.</div>`;
    return;
  }

  notes.forEach((note, index) => {
    let catClass = "outros";
    if (note.category === "Rito") catClass = "rito";
    if (note.category === "Tradição" || note.category === "Tradicao") catClass = "tradicao";
    if (note.category === "Ideia") catClass = "ideia";

    const card = document.createElement("div");
    card.className = "admin-note-card";
    card.innerHTML = `
      <button class="btn-edit-note btn-edit-note-item" data-index="${index}" title="Editar">✏️</button>
      <button class="btn-delete-note btn-delete-note-item" data-index="${index}" title="Excluir">&times;</button>
      <div class="admin-note-card-title">${escapeHTML(note.title)}</div>
      <span class="admin-note-card-category ${catClass}">${escapeHTML(note.category)}</span>
      <div class="admin-note-card-content">${escapeHTML(note.content)}</div>
    `;
    notesCardsContainer.appendChild(card);
  });
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("wedding_notes")) || [];
  if (confirm(`Deseja mesmo excluir a nota "${notes[index].title}"?`)) {
    notes.splice(index, 1);
    localStorage.setItem("wedding_notes", JSON.stringify(notes));
    saveToGoogleSheets();
    renderNotes();
  }
}

// Formulário de Adicionar Nota
if (formAddNote) {
  formAddNote.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("note-title");
    const categoryInput = document.getElementById("note-category");
    const contentInput = document.getElementById("note-content");

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const content = contentInput.value.trim();

    if (!title || !content) return;

    const notes = JSON.parse(localStorage.getItem("wedding_notes")) || [];
    
    if (editingNoteIndex === null) {
      notes.push({ title, category, content });
    } else {
      notes[editingNoteIndex] = { title, category, content };
      editingNoteIndex = null;
      if (btnSubmitNote) btnSubmitNote.textContent = "+ Adicionar";
      if (btnCancelEditNote) btnCancelEditNote.style.display = "none";
    }

    localStorage.setItem("wedding_notes", JSON.stringify(notes));
    saveToGoogleSheets();

    formAddNote.reset();
    renderNotes();
  });
}

function editNote(index) {
  const notes = JSON.parse(localStorage.getItem("wedding_notes")) || [];
  const note = notes[index];
  if (!note) return;

  editingNoteIndex = index;

  document.getElementById("note-title").value = note.title;
  document.getElementById("note-category").value = note.category;
  document.getElementById("note-content").value = note.content;

  if (btnSubmitNote) btnSubmitNote.textContent = "Salvar";
  if (btnCancelEditNote) btnCancelEditNote.style.display = "block";

  const formEl = document.getElementById("form-add-note");
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
}

if (btnCancelEditNote) {
  btnCancelEditNote.addEventListener("click", () => {
    editingNoteIndex = null;
    formAddNote.reset();
    if (btnSubmitNote) btnSubmitNote.textContent = "+ Adicionar";
    btnCancelEditNote.style.display = "none";
  });
}

// Fechar modais ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target === giftModal) {
    giftModal.classList.remove("active");
  }
  if (e.target === adminModal) {
    adminModal.classList.remove("active");
  }
  if (e.target === attireModal) {
    attireModal.classList.remove("active");
  }
  if (e.target === lightboxModal) {
    lightboxModal.classList.remove("active");
  }
});

// =========================================
// 6. CONTROLE DO PLAYER DE ÁUDIO ÉLFICO
// =========================================
const btnAudioControl = document.getElementById("btn-audio-control");
const bgMusic = document.getElementById("bg-music");
const iconMusic = btnAudioControl.querySelector(".icon-music");
const eqBars = btnAudioControl.querySelector(".eq-bars");
const audioTooltip = document.querySelector(".audio-tooltip");

let isMusicPlaying = false;

function toggleAudio() {
  if (bgMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
}

function playMusic() {
  bgMusic.play().then(() => {
    isMusicPlaying = true;
    localStorage.setItem("music-preference", "playing");
    iconMusic.style.display = "none";
    eqBars.style.display = "flex";
    if (audioTooltip) audioTooltip.classList.remove("show-hint");
  }).catch(err => {
    console.log("Autoplay block or audio play failed:", err);
  });
}

function pauseMusic() {
  bgMusic.pause();
  isMusicPlaying = false;
  localStorage.setItem("music-preference", "paused");
  iconMusic.style.display = "block";
  eqBars.style.display = "none";
}

// Vincula evento de clique ao botão
btnAudioControl.addEventListener("click", toggleAudio);

// Trata inicialização e preferências de música salvas no navegador
window.addEventListener("DOMContentLoaded", () => {
  const musicPref = localStorage.getItem("music-preference");
  
  if (musicPref === "playing") {
    playMusic();
  } else if (musicPref !== "paused") {
    // Se for primeira visita, mostra a dica da música por 6 segundos
    if (audioTooltip) {
      audioTooltip.classList.add("show-hint");
      setTimeout(() => {
        audioTooltip.classList.remove("show-hint");
      }, 6000);
    }
  }
});

// Tenta tocar na primeira interação com a página (scroll, clique, toque) se não houver bloqueio salvo
const startAutoplayOnInteraction = () => {
  const musicPref = localStorage.getItem("music-preference");
  if (musicPref !== "paused" && !isMusicPlaying) {
    playMusic();
  }
  // Remove ouvintes para executar somente uma vez por recarregamento
  window.removeEventListener("click", startAutoplayOnInteraction);
  window.removeEventListener("scroll", startAutoplayOnInteraction);
  window.removeEventListener("touchstart", startAutoplayOnInteraction);
};

window.addEventListener("click", startAutoplayOnInteraction);
window.addEventListener("scroll", startAutoplayOnInteraction);
window.addEventListener("touchstart", startAutoplayOnInteraction);

// =========================================
// 7. BACKUP E RESTAURAÇÃO DE DADOS (JSON)
// =========================================
const btnExportJson = document.getElementById("btn-export-json");
const btnImportJson = document.getElementById("btn-import-json");
const inputImportJson = document.getElementById("input-import-json");

if (btnExportJson) {
  btnExportJson.addEventListener("click", () => {
    const backupData = {
      wedding_custom_guests: JSON.parse(localStorage.getItem("wedding_custom_guests")) || {},
      wedding_vendors: JSON.parse(localStorage.getItem("wedding_vendors")) || [],
      wedding_expenses: JSON.parse(localStorage.getItem("wedding_expenses")) || [],
      wedding_notes: JSON.parse(localStorage.getItem("wedding_notes")) || [],
      wedding_rsvps: JSON.parse(localStorage.getItem("wedding_rsvps")) || []
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `casamento_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

if (btnImportJson && inputImportJson) {
  btnImportJson.addEventListener("click", () => {
    inputImportJson.click();
  });

  inputImportJson.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        if (
          backupData.wedding_custom_guests === undefined &&
          backupData.wedding_vendors === undefined &&
          backupData.wedding_expenses === undefined &&
          backupData.wedding_notes === undefined
        ) {
          alert("Arquivo de backup inválido ou incompatível!");
          return;
        }

        if (confirm("Importar este arquivo substituirá todos os seus dados atuais de Convidados, Fornecedores, Financeiro e Ideias por este backup. Deseja continuar?")) {
          if (backupData.wedding_custom_guests) {
            localStorage.setItem("wedding_custom_guests", JSON.stringify(backupData.wedding_custom_guests));
          }
          if (backupData.wedding_vendors) {
            localStorage.setItem("wedding_vendors", JSON.stringify(backupData.wedding_vendors));
          }
          if (backupData.wedding_expenses) {
            localStorage.setItem("wedding_expenses", JSON.stringify(backupData.wedding_expenses));
          }
          if (backupData.wedding_notes) {
            localStorage.setItem("wedding_notes", JSON.stringify(backupData.wedding_notes));
          }
          if (backupData.wedding_rsvps) {
            localStorage.setItem("wedding_rsvps", JSON.stringify(backupData.wedding_rsvps));
          }

          // Recarregar os dados na tela
          initializeAdminDashboard();
          saveToGoogleSheets();
          alert("Backup restaurado com sucesso!");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo de backup: " + err.message);
      }
    };
    reader.readAsText(file);
    inputImportJson.value = "";
  });
}

// =========================================
// 8. SINCRONIZAÇÃO NATIVA COM O GOOGLE DRIVE
// =========================================
function syncFromGoogleSheets() {
  if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    initializeAdminDashboard();
    return;
  }

  const syncStatus = document.getElementById("cloud-sync-status");
  if (syncStatus) {
    syncStatus.innerHTML = "🔄 Sincronizando com o Google Drive...";
    syncStatus.style.color = "var(--gold)";
  }

  fetch(`${GOOGLE_SHEET_URL}?action=loadAll`)
    .then(res => res.json())
    .then(data => {
      if (data && !data.error) {
        if (data.customGuests) localStorage.setItem("wedding_custom_guests", JSON.stringify(data.customGuests));
        if (data.vendors) localStorage.setItem("wedding_vendors", JSON.stringify(data.vendors));
        if (data.expenses) localStorage.setItem("wedding_expenses", JSON.stringify(data.expenses));
        if (data.notes) localStorage.setItem("wedding_notes", JSON.stringify(data.notes));
        if (data.rsvps) localStorage.setItem("wedding_rsvps", JSON.stringify(data.rsvps));
        
        if (syncStatus) {
          syncStatus.innerHTML = "☁️ Sincronizado com o Drive";
          syncStatus.style.color = "#4ade80";
        }
      } else {
        if (syncStatus) {
          syncStatus.innerHTML = "⚠️ Falha ao ler nuvem (modo local)";
          syncStatus.style.color = "#f87171";
        }
      }
      initializeAdminDashboard();
    })
    .catch(err => {
      console.error("Erro na sincronização:", err);
      if (syncStatus) {
        syncStatus.innerHTML = "⚠️ Offline / Falha de conexão";
        syncStatus.style.color = "#f87171";
      }
      initializeAdminDashboard();
    });
}

function saveToGoogleSheets() {
  if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    return;
  }

  const syncStatus = document.getElementById("cloud-sync-status");
  if (syncStatus) {
    syncStatus.innerHTML = "🔄 Salvando alterações no Drive...";
    syncStatus.style.color = "var(--gold)";
  }

  const payload = {
    action: "syncAll",
    data: {
      customGuests: JSON.parse(localStorage.getItem("wedding_custom_guests")) || {},
      vendors: JSON.parse(localStorage.getItem("wedding_vendors")) || [],
      expenses: JSON.parse(localStorage.getItem("wedding_expenses")) || [],
      notes: JSON.parse(localStorage.getItem("wedding_notes")) || []
    }
  };

  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  })
  .then(() => {
    if (syncStatus) {
      syncStatus.innerHTML = "☁️ Alterações salvas no Drive";
      syncStatus.style.color = "#4ade80";
    }
  })
  .catch(err => {
    console.error("Erro ao salvar na nuvem:", err);
    if (syncStatus) {
      syncStatus.innerHTML = "⚠️ Falha ao salvar (salvo localmente)";
      syncStatus.style.color = "#f87171";
    }
  });
}

/*
=================================================================================
NOVO CÓDIGO DO GOOGLE APPS SCRIPT (MULTI-ABAS: RSVP, CONVIDADOS, FORNECEDORES, CUSTOS, IDEIAS)
=================================================================================
Substitua todo o código do seu Google Apps Script por este. Ele gerenciará todas as 
planilhas no mesmo arquivo de planilha automaticamente (criando abas adicionais).

function doGet(e) {
  try {
*/
