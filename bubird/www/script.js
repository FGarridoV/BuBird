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
function togglePanel(containerId, iconId) {
    const container = document.getElementById(containerId);
    const icon = document.getElementById(iconId);
    if (container.classList.contains('open')) {
        container.classList.remove('open');
        icon.innerText = '▼';
    } else {
        container.classList.add('open');
        icon.innerText = '▲';
        if(containerId === 'log-container') {
            const output = document.getElementById('log-output');
            output.scrollTop = output.scrollHeight; 
        }
    }
}

// --- 5. SWITCHING PASSWORD AND COMMANDS (API TO PYTHON) ---
let currentPassword = ""; 

async function checkPassword() {
    const pwdInput = document.getElementById('admin-pwd').value;
    const errorMsg = document.getElementById('auth-error');
    
    try {
        const response = await fetch('http://' + window.location.hostname + ':5000', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwdInput, command: "PING" })
        });
        
        const data = await response.json();
        
        if (data.status === "error" && data.message === "Invalid Password") {
            errorMsg.innerText = "Invalid Password";
            errorMsg.style.display = 'block';
        } else {

            currentPassword = pwdInput;
            errorMsg.style.display = 'none';
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('control-section').style.display = 'block';
        }
    } catch (error) {
        errorMsg.innerText = "Error connecting to the local API server";
        errorMsg.style.display = 'block';
        console.error("API Fetch Error:", error);
    }
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
            alert("System Error: " + data.message);
        }
    } catch (error) {
        alert("Connection error sending UDP command to Raspberry.");
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

    // B. Manual or Auto Mode?
    const modeIcon = document.getElementById('icon-mode');
    const manualControls = document.querySelectorAll('.manual-only');
    
    // Reverse logs to find the most recent mode change first
    const logsRev = logText.split('\n').reverse().join('\n');
    
    // Check for "Modo AUTOMÁTICO" vs "Modo MANUAL"
    const idxAuto = logsRev.indexOf("Modo AUTOMÁTICO");
    const idxManual = logsRev.indexOf("Modo MANUAL");
    
    if (idxManual > -1 && (idxAuto === -1 || idxManual < idxAuto)) {
        modeIcon.innerText = "🖐️ Manual";
        manualControls.forEach(el => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; });
    } else {
        modeIcon.innerText = "⚙️ Auto";
        manualControls.forEach(el => { el.style.opacity = '0.5'; el.style.pointerEvents = 'none'; });
    }

    // C. Flash On or Off?
    const lightIcon = document.getElementById('icon-light');
    const idxLightOn = logsRev.indexOf("[FLASH] Encendiendo");
    const idxLightOff = logsRev.indexOf("[FLASH] Apagando");
    if (idxLightOn > -1 && (idxLightOff === -1 || idxLightOn < idxLightOff)) {
        lightIcon.innerText = "💡 On";
    } else {
        lightIcon.innerText = "💡 Off";
    }

    // D. OTA Server Status
    const otaIcon = document.getElementById('icon-ota');
    const idxOtaOn = logsRev.indexOf("[OTA] Servidor INICIADO");
    const idxOtaOff = logsRev.indexOf("[OTA] Servidor APAGADO");
    if (idxOtaOn > -1 && (idxOtaOff === -1 || idxOtaOn < idxOtaOff)) {
        otaIcon.innerText = "☁️ On";
    } else {
        otaIcon.innerText = "☁️ Off";
    }
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