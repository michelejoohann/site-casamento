// CONFIGURAÇÕES DO CASAMENTO
// 1. Cole aqui a URL gerada pelo Google Apps Script (ex: https://script.google.com/macros/s/AKfycb.../exec)
// Se deixar como está, o site usará o painel administrativo local (localStorage) como teste.
const GOOGLE_SHEET_URL = "SUA_URL_DO_GOOGLE_SCRIPT_AQUI";

const CASAMENTO_DATE = new Date("2027-09-21T19:00:00").getTime(); // 21 de Setembro de 2027, 19:00h
const ADMIN_PASSWORD = "beren"; // Senha para o painel de testes local

// Elementos da página
const elDays = document.getElementById("days");
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");

// =========================================
// 1. CONTADOR REGRESSIVO
// =========================================
function updateCountdown() {
  const now = new Date().getTime();
  const diff = CASAMENTO_DATE - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "<div class='countdown-box' style='width:100%;'><span class='countdown-number'>Chegou o Grande Dia!</span></div>";
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
// 2. MODAL DE PRESENTES (COTAS PIX)
// =========================================
const giftModal = document.getElementById("gift-modal");
const closeGiftModal = document.getElementById("close-gift-modal");
const modalGiftTitle = document.getElementById("modal-gift-title");
const modalGiftPrice = document.getElementById("modal-gift-price");
const btnCopyPix = document.getElementById("btn-copy-pix");
const pixKeyVal = document.getElementById("pix-key-val");

// Abrir modal de presente
document.querySelectorAll(".btn-gift").forEach(button => {
  button.addEventListener("click", () => {
    const giftTitle = button.getAttribute("data-title");
    const giftPrice = button.getAttribute("data-price");

    modalGiftTitle.textContent = giftTitle;
    modalGiftPrice.textContent = giftPrice === "Livre" ? "Valor Livre" : `R$ ${giftPrice}`;
    
    giftModal.classList.add("active");
  });
});

// Fechar modal de presente
closeGiftModal.addEventListener("click", () => {
  giftModal.classList.remove("active");
  btnCopyPix.textContent = "Copiar";
});

// Copiar chave PIX
btnCopyPix.addEventListener("click", () => {
  navigator.clipboard.writeText(pixKeyVal.textContent).then(() => {
    btnCopyPix.textContent = "Copiado!";
    btnCopyPix.style.backgroundColor = "var(--gold)";
    btnCopyPix.style.color = "var(--bg-dark)";
    setTimeout(() => {
      btnCopyPix.textContent = "Copiar";
      btnCopyPix.style.backgroundColor = "transparent";
      btnCopyPix.style.color = "var(--gold)";
    }, 2000);
  }).catch(err => {
    console.error("Falha ao copiar: ", err);
  });
});

// =========================================
// 3. FLUXO RSVP (CONFIRMAÇÃO DE PRESENÇA)
// =========================================
const rsvpForm = document.getElementById("rsvp-form");
const btnSubmit = rsvpForm.querySelector(".btn-submit");
const radioAttendance = document.getElementsByName("attendance");
const companionsGroup = document.getElementById("companions-group");

// Esconder/Mostrar campo de acompanhantes baseado na resposta
radioAttendance.forEach(radio => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "Ausente") {
      companionsGroup.style.display = "none";
    } else {
      companionsGroup.style.display = "block";
    }
  });
});

// Envio do RSVP
rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  const companions = attendance === "Ausente" ? 0 : parseInt(document.getElementById("companions").value, 10);
  const message = document.getElementById("message").value.trim();

  const rsvpData = {
    name,
    email,
    whatsapp,
    attendance,
    companions,
    message,
    date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR")
  };

  // Se o Google Sheets estiver configurado
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "SUA_URL_DO_GOOGLE_SCRIPT_AQUI") {
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rsvpData)
    })
    .then(() => {
      // Como usamos 'no-cors' para evitar problemas de CORS do Google Script,
      // a resposta retorna opaca, mas a gravação é concluída com sucesso.
      showRsvpSuccess(name, attendance);
      rsvpForm.reset();
      companionsGroup.style.display = "block";
    })
    .catch(err => {
      console.error("Erro ao enviar para planilha: ", err);
      alert("Houve um erro ao enviar sua confirmação. Por favor, tente novamente.");
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Confirmação";
    });

  } else {
    // Caso de teste/fallback: Salvar localmente no localStorage
    let currentRSVPs = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
    rsvpData.id = Date.now();
    currentRSVPs.push(rsvpData);
    localStorage.setItem("wedding_rsvps", JSON.stringify(currentRSVPs));

    showRsvpSuccess(name, attendance);
    rsvpForm.reset();
    companionsGroup.style.display = "block";
  }
});

function showRsvpSuccess(name, attendance) {
  if (attendance === "Confirmado") {
    alert(`Obrigado pela confirmação, ${name}! Nos vemos no dia 21 de Setembro de 2027! 🌿✨`);
  } else {
    alert(`Sentiremos sua falta, ${name}! Agradecemos por nos avisar. 🤍`);
  }
}

// =========================================
// 4. PAINEL ADMINISTRATIVO LOCAL (TESTES)
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
    alert("Senha incorreta! Que as águias levem você embora.");
    adminPassInput.value = "";
  }
}

// Renderizar Lista de Convidados
function renderGuestList() {
  const rsvps = JSON.parse(localStorage.getItem("wedding_rsvps")) || [];
  guestListRows.innerHTML = "";

  if (rsvps.length === 0) {
    guestListRows.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver);">Nenhuma confirmação recebida ainda no modo de testes.</td></tr>`;
    return;
  }

  rsvps.forEach(rsvp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight:600; color:var(--gold-light);">${escapeHTML(rsvp.name)}</td>
      <td><span style="color:${rsvp.attendance === 'Confirmado' ? '#4ade80' : '#f87171'};">${rsvp.attendance}</span></td>
      <td style="text-align:center;">${rsvp.companions}</td>
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

  let csvContent = "\uFEFFNome;Presenca;Acompanhantes;WhatsApp;Email;Mensagem;DataConfirmacao\n";
  rsvps.forEach(rsvp => {
    const name = rsvp.name.replace(/;/g, ",");
    const email = rsvp.email.replace(/;/g, ",");
    const whatsapp = rsvp.whatsapp.replace(/;/g, ",");
    const msg = (rsvp.message || "").replace(/;/g, ",").replace(/\n/g, " ");
    csvContent += `"${name}";"${rsvp.attendance}";${rsvp.companions};"${whatsapp}";"${email}";"${msg}";"${rsvp.date}"\n`;
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
  if (confirm("Deseja mesmo limpar as confirmações de testes locais?")) {
    localStorage.removeItem("wedding_rsvps");
    renderGuestList();
  }
});

// Fechar modais ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target === giftModal) {
    giftModal.classList.remove("active");
    btnCopyPix.textContent = "Copiar";
  }
  if (e.target === adminModal) {
    adminModal.classList.remove("active");
  }
});

/*
=================================================================================
CÓDIGO DO GOOGLE APPS SCRIPT (CRIE UMA PLANILHA NO GOOGLE DRIVE E COLE ESSE CÓDIGO)
=================================================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Insere os dados na planilha como uma nova linha
    sheet.appendRow([
      data.name,
      data.email,
      data.whatsapp,
      data.attendance,
      data.companions,
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
