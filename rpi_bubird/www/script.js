// --- 0. BURGER MENU ---
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active-menu');
}

// --- 1. SECTION SWITCHING ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    document.getElementById('nav-' + sectionId).classList.add('active');
    
    document.getElementById('navMenu').classList.remove('active-menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 2. LANGUAGE TRANSLATIONS ---
const translations = {
    es: {
        nav_home: "Inicio", nav_live: "En Vivo", nav_gallery: "Galería",
        hero_title: "Bienvenidos al Nido",
        hero_desc: "Un proyecto de hardware libre, código abierto y mucho cariño. Aquí observamos en tiempo real el ciclo de la vida de nuestras aves locales, sin invadir su espacio natural.",
        hero_btn: "Ver Cámara en Vivo 🔴",
        how_title: "¿Cómo funciona este proyecto?",
        tech_1_title: "📷 Los Ojos", tech_1_desc: "Un ESP32-CAM programado en C++ para capturar imágenes y enviarlas a través del Wi-Fi.",
        tech_2_title: "🧠 El Cerebro", tech_2_desc: "Una Raspberry Pi ejecutando MediaMTX y FFmpeg para procesar el video y enviarlo a la web.",
        tech_3_title: "⚡ La Magia", tech_3_desc: "Tecnología WebRTC para lograr una latencia casi nula. ¡Lo ves al mismo tiempo que ocurre!",
        live_title: "Cámara Principal", live_badge: "EN VIVO",
        live_note: "El video utiliza WebRTC para transmisión en tiempo real. Puede tardar unos segundos en cargar inicialmente.",
        log_btn: "Terminal de Logs del Sistema",
        gallery_title: "La Historia del Nido",
        gal_1_title: "Construcción de la Casa", gal_1_desc: "Armando el hogar de madera a medida para nuestros futuros inquilinos.",
        gal_2_title: "Instalación del Sistema", gal_2_desc: "Montando el ESP32-CAM y configurando la Raspberry Pi.",
        gal_3_title: "Llegada del Pajarito", gal_3_desc: "El primer visitante inspeccionando la nueva propiedad.",
        gal_4_title: "Construcción del Nido", gal_4_desc: "Acomodando ramitas, plumas y hojas con mucha dedicación.",
        gal_5_title: "Primeros Huevitos", gal_5_desc: "Fecha estimada. Esperando el momento exacto del desove.",
        gal_6_title: "Eclosión", gal_6_desc: "El momento mágico en que rompen el cascarón.",
        gal_7_title: "Primer Vuelo", gal_7_desc: "Cuando dejen el nido por primera vez para explorar el mundo.",
        footer: "Desarrollado con ☕, Raspberry Pi y ESP32."
    },
    en: {
        nav_home: "Home", nav_live: "Live Cam", nav_gallery: "Gallery",
        hero_title: "Welcome to the Nest",
        hero_desc: "An open-source hardware project made with love. Here we observe the life cycle of our local birds in real-time, without invading their natural space.",
        hero_btn: "Watch Live Camera 🔴",
        how_title: "How does this project work?",
        tech_1_title: "📷 The Eyes", tech_1_desc: "An ESP32-CAM programmed in C++ to capture images and stream them over Wi-Fi.",
        tech_2_title: "🧠 The Brain", tech_2_desc: "A Raspberry Pi running MediaMTX and FFmpeg to process the video and serve it to the web.",
        tech_3_title: "⚡ The Magic", tech_3_desc: "WebRTC technology for near-zero latency. You see it exactly as it happens!",
        live_title: "Main Camera", live_badge: "LIVE",
        live_note: "The video uses WebRTC for real-time streaming. It may take a few seconds to load initially.",
        log_btn: "System Logs Terminal",
        gallery_title: "The Nest's Story",
        gal_1_title: "Birdhouse Construction", gal_1_desc: "Building the custom wooden home for our future tenants.",
        gal_2_title: "System Installation", gal_2_desc: "Mounting the ESP32-CAM and configuring the Raspberry Pi.",
        gal_3_title: "Arrival of the Bird", gal_3_desc: "The first visitor inspecting the new property.",
        gal_4_title: "Nest Building", gal_4_desc: "Arranging twigs, feathers, and leaves with great dedication.",
        gal_5_title: "First Eggs", gal_5_desc: "Estimated date. Waiting for the exact moment of spawning.",
        gal_6_title: "Hatching", gal_6_desc: "The magical moment they break the shell.",
        gal_7_title: "First Flight", gal_7_desc: "When they leave the nest for the first time to explore the world.",
        footer: "Developed with ☕, Raspberry Pi and ESP32."
    }
};

// --- 3. SWITCHING LANGUAGE ---
let currentLang = 'es';

function toggleLang() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    document.getElementById('lang-btn').innerText = currentLang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES';
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.innerText = translations[currentLang][key];
        }
    });
}

// --- 4. SWITCHING COLLAPSIBLE PANELS ---
function togglePanel(containerId) {
    const container = document.getElementById(containerId);
    if (container.classList.contains('open')) {
        container.classList.remove('open');
    } else {
        container.classList.add('open');
        if(containerId === 'log-container') {
            const output = document.getElementById('log-output');
            output.scrollTop = output.scrollHeight; 
        }
    }
}

// --- 5. SWITCHING PASSWORD AND COMMANDS (API TO PYTHON) ---
let currentPassword = ""; 
let isAdmin = false;

// Variables to keep track of current states
let isManualMode = false;
let isFlashOn = false;
let isOtaOn = false;

function updateLocks() {
    const modeWrapper = document.getElementById('sw-wrapper-mode');
    const lightWrapper = document.getElementById('sw-wrapper-light');
    const otaWrapper = document.getElementById('sw-wrapper-ota');

    if (isAdmin) {
        modeWrapper.classList.remove('disabled');
        // Si está en manual, habilitar los otros dos controles
        if (isManualMode) {
            lightWrapper.classList.remove('disabled');
            otaWrapper.classList.remove('disabled');
        } else {
            lightWrapper.classList.add('disabled');
            otaWrapper.classList.add('disabled');
        }
    } else {
        modeWrapper.classList.add('disabled');
        lightWrapper.classList.add('disabled');
        otaWrapper.classList.add('disabled');
    }
}

async function authenticateAdmin() {
    if (isAdmin) {
        // Option to logout
        if (confirm("¿Cerrar sesión de administrador?")) {
            isAdmin = false;
            currentPassword = "";
            document.getElementById('icon-admin').innerText = '🔒';
            updateLocks();
        }
        return;
    }

    const pwdInput = prompt("Introduce la contraseña de administrador para habilitar el control:");
    if (!pwdInput) return;
    
    try {
        const response = await fetch('http://' + window.location.hostname + ':5000', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwdInput, command: "PING" })
        });
        
        const data = await response.json();
        
        if (data.status === "error" && data.message === "Invalid password") {
            alert("Contraseña incorrecta");
        } else {
            currentPassword = pwdInput;
            isAdmin = true;
            document.getElementById('icon-admin').innerText = '🔓';
            alert("Modo administrador activado.");
            updateLocks();
        }
    } catch (error) {
        alert("Error de conexión al servidor local API");
        console.error("API Fetch Error:", error);
    }
}

function toggleMode(e) {
    if (!isAdmin) { 
        e.preventDefault(); 
        alert("Requiere ser administrador."); 
        return; 
    }
    // Determinar comando: si el toggle se acaba de encender, enviamos MANUAL
    const targetState = e.target.checked; 
    sendCommand(targetState ? 'MODO:MANUAL' : 'MODO:AUTO');
    // Previene que cambie inmediatamente, el log confirmará el cambio
    e.preventDefault();
}

function toggleFlash(e) {
    if (!isAdmin) { e.preventDefault(); return; }
    if (!isManualMode) { e.preventDefault(); alert("El Flash solo se puede controlar en Modo Manual."); return; }
    const targetState = e.target.checked; 
    sendCommand(targetState ? 'FLASH:ON' : 'FLASH:OFF');
    e.preventDefault();
}

function toggleOTA(e) {
    if (!isAdmin) { e.preventDefault(); return; }
    if (!isManualMode) { e.preventDefault(); alert("OTA solo se puede controlar en Modo Manual."); return; }
    const targetState = e.target.checked; 
    sendCommand(targetState ? 'OTA:ON' : 'OTA:OFF');
    e.preventDefault();
}

async function sendCommand(cmd) {
    if (!currentPassword) return; 
    
    try {
        const response = await fetch('http://' + window.location.hostname + ':5000', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: currentPassword, command: cmd })
        });
        
        const data = await response.json();
        if (data.status === "error") {
            alert("Error del Sistema: " + data.message);
        }
    } catch (error) {
        alert("Error de conexión al enviar el comando.");
    }
}

// --- 6. SMART LOG PARSER PARA ACTUALIZAR ICONOS DE ESTADO ---
function updateStatusIcons(logText) {
    // A. Sleeping or Awake?
    const badge = document.getElementById('main-status-badge');
    const badgeText = document.getElementById('main-status-text');
    if (logText.includes("Zzz") || logText.includes("A dormir")) {
        badge.classList.add('sleeping');
        badgeText.innerText = "DURMIENDO";
    } else {
        badge.classList.remove('sleeping');
        badgeText.innerText = "EN VIVO";
    }

    // Usamos reverse para encontrar el último estado
    const logsRev = logText.split('\n').reverse().join('\n');
    
    // B. Manual or Auto Mode?
    // En main.cpp dice: "[ESP] Changing to MANUAL MODE" o "AUTO MODE"
    // (O textos equivalentes según lo encontrado)
    const idxAuto = logsRev.indexOf("AUTO MODE");
    const idxManual = logsRev.indexOf("MANUAL MODE");
    if (idxManual > -1 && (idxAuto === -1 || idxManual < idxAuto)) {
        isManualMode = true;
        document.getElementById('toggle-mode').checked = true;
    } else {
        isManualMode = false;
        document.getElementById('toggle-mode').checked = false;
    }

    // C. Flash On or Off?
    // En main.cpp dice: "Turning FLASH on" y "Turning FLASH off"
    const idxLightOn = logsRev.indexOf("Turning FLASH on");
    const idxLightOff = logsRev.indexOf("Turning FLASH off");
    if (idxLightOn > -1 && (idxLightOff === -1 || idxLightOn < idxLightOff)) {
        isFlashOn = true;
        document.getElementById('toggle-light').checked = true;
    } else {
        isFlashOn = false;
        document.getElementById('toggle-light').checked = false;
    }

    // D. OTA Server Status
    // En main.cpp dice: "Starting OTA Server" y "OTA Server STOPPED"
    const idxOtaOn = logsRev.indexOf("Starting OTA Server");
    const idxOtaOff = logsRev.indexOf("OTA Server STOPPED");
    if (idxOtaOn > -1 && (idxOtaOff === -1 || idxOtaOn < idxOtaOff)) {
        isOtaOn = true;
        document.getElementById('toggle-ota').checked = true;
    } else {
        isOtaOn = false;
        document.getElementById('toggle-ota').checked = false;
    }

    // Actualizar candados de los toggles según estados y autenticación
    updateLocks();
}

// --- 7. FETCH REAL LOGS FROM THE SERVER EVERY 2 SECONDS ---
async function fetchRealLogs() {
    try {
        const response = await fetch('logs.txt?t=' + new Date().getTime());
        if (response.ok) {
            const text = await response.text();
            let lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 50) lines = lines.slice(lines.length - 50);
            
            const output = document.getElementById('log-output');
            const newText = lines.join('\n');
            
            if (output.innerText !== newText) {
                output.innerText = newText;
                output.scrollTop = output.scrollHeight;
                
                updateStatusIcons(text);
            }
        }
    } catch (error) {
        console.error("Error cargando logs: ", error);
    }
}

setInterval(fetchRealLogs, 2000);