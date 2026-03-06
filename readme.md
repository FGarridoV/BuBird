# 🐦 BuBird - Smart Birdhouse Observatory
*Welcome to the nest 🪺!*

**BuBird** is an open-source hardware/software project designed to observe the life cycle of local birds in real-time, with near-zero latency, and without invading their natural space. The system combines solar energy and the efficiency of an **ESP32-CAM** with the processing power of a **Raspberry Pi**, offering live video streaming via WebRTC and an remote control Dashboard. 

In this repository we provide instructions and resources for everyone to implement this project. You are free to choose any bird house, however, we built this project on the [SWEDISH BIRD HOUSE](https://www.thingiverse.com/thing:2503022) contributed by [PurchenZuPoden](https://www.thingiverse.com/PurchenZuPoden/designs) on Thingiverse.

## 🛠️ Project requirements

* **Raspberry Pi**: I've used a Pi5 8Gb, But I think with a 3B+, any Pi4 or higher will work.
* **ESP32-CAM**: I've used a clone of the AI Thinker [buy](https://amzn.eu/d/01GnobxX)
* **2.4Ghz WiFi Antenna** [buy](https://www.otronic.nl/nl/24ghz-wifi-antenne-met-sma-naar-ufl-ipex-connector.html)
* **PIR sensor HC-SR501** [buy](https://www.otronic.nl/nl/pir-sensor-hc-sr501-bewegingssensor.html)
* **Solar module CN3065** [buy](https://www.otronic.nl/nl/500ma-mini-solar-lipo-lithium-lader-modu-140567801.html)
* **LIPO Baterry** [buy](https://www.otronic.nl/nl/37v-4000mah-oplaadbare-lipo-lithium-polyemer-platt.html)
* **Solar Panel**



---

## ✨ Key Features

* 🔋 **Energy Efficiency (Deep Sleep):** Interrupt-based system. The PIR sensor wakes the camera upon detecting motion and sends it to sleep after 1 minute of inactivity, maximizing battery life.
* ⚡ **Ultra-Low Latency Streaming:** Real-time video transmission using RTSP converted to WebRTC via MediaMTX, allowing you to watch the nest without delay.
* 🧠 **State Machine (Auto/Manual):** Take remote control of the camera via UDP, overriding the PIR sensor to keep the system awake on demand.
* 💡 **Soft Flash (PWM):** Gradual toggling of the camera's LED to avoid scaring the birds or causing power spikes (*Brownouts*).
* ☁️ **Over-The-Air Updates (OTA On-Demand):** Integrated with ElegantOTA. The internal web server only spins up when manually activated, freeing up valuable RAM during normal operation.
* 🛡️ **Secure Web Dashboard:** Responsive, multilingual (EN/ES) UI hosted on Nginx with a password-protected control panel. Includes dynamic, real-time system log reading.
* 🪨 **Bulletproof Firmware:** C++ code (PlatformIO) optimized with core separation (FreeRTOS), forced PSRAM, and a 160MHz clock speed to prevent overheating and crashes (*Guru Meditation* errors).

---

## 🛠️ System Architecture

The project is divided into two main blocks:

### 1. The Eye (ESP32-CAM)

Programmed in PlatformIO (`C++`). Manages the camera, PIR sensor, and Wi-Fi connection. It streams RTSP video and communicates with the backend via UDP packets (for logging and receiving commands).

### 2. The Brain (Raspberry Pi / Docker Server)

Orchestrates three Docker containers:

* **MediaMTX:** Receives the RTSP stream from the ESP32-CAM and serves it to the web via WebRTC.
* **Comms Server (Python):** A lightweight UDP/HTTP server that saves logs, auto-discovers the camera's IP, securely verifies web passwords, and sends control commands to the ESP32.
* **Nginx:** Serves the web frontend (HTML/JS/CSS) where users can watch the nest and interact with the admin panel.

---

## 🧰 Hardware Requirements

* 1x **AI-Thinker ESP32-CAM** board (with OV2640 camera module).
* 1x **PIR** Motion Sensor (e.g., AM312 or SR501). Connected to `GPIO 13`.
* 1x Local Server / **Raspberry Pi** (To host the Docker containers).
* High-quality power supply (5V / 2A minimum) for the ESP32.

---

## 🚀 Installation & Deployment

### 1. Flashing the ESP32-CAM

1. Install [Visual Studio Code](https://code.visualstudio.com/) and the [PlatformIO](https://platformio.org/) extension.
2. Open the project's firmware folder.
3. Configure your Wi-Fi credentials and UDP server IP in `src/main.cpp`.
4. Connect the ESP32-CAM and click "Upload". PlatformIO will handle dependencies (ESP32-RTSPServer, ElegantOTA) automatically.

### 2. Deploying the Backend (Docker)

Make sure you have Docker and Docker Compose installed on your Raspberry Pi or local server.

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/BuBird.git
cd BuBird

# Start the services in the background
docker compose up -d

```

### 3. Configuring the Dashboard

1. By default, the admin control panel password is `nido`.
2. To change it, edit the `PASSWORD` variable in `comms/comms_server.py` and restart the container:
`docker restart bubird_comms`

---

## 🎮 Dashboard Usage

Access your Raspberry Pi's IP address in your web browser (e.g., `http://192.168.1.60`).
In the **"Live Cam"** section, expand the *Control Panel* and enter the password to access the Admin options:

* **Automatic:** Normal behavior governed by the PIR sensor.
* **Manual:** Keeps the camera awake and recording indefinitely.
* **Flash:** Turns the LED on/off gradually (Only available in Manual mode).
* **OTA:** Enables the `http://<ESP32_IP>/update` route to flash new firmware over Wi-Fi (Only available in Manual mode).
* **Sleep:** Forces an immediate Deep Sleep.

The system logs terminal on the page interprets these actions in real-time and updates the system status icons accordingly (Sleeping, Live, ⚙️, 🖐️, 💡, ☁️).

---

## 📜 License

This project is open-source. Feel free to clone it, modify it, and use it to observe wildlife in your own backyard!

*Developed with ☕, lots of C++ code, and a passion for nature.*

---
