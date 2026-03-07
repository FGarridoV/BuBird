#include <Arduino.h>           
#include "esp_camera.h"
#include <WiFi.h>
#include <ESP32-RTSPServer.h>
#include "time.h" 
#include <WiFiUdp.h>
#include "soc/soc.h"           
#include "soc/rtc_cntl_reg.h"  
#include "soc/rtc.h"
#include <WebServer.h>
#include <ElegantOTA.h>

const char* ssid = "SSID";
const char* password = "PASSWORD";

// --- UDP CONFIGURATION ---
WiFiUDP udp;
IPAddress udpAddress(192, 168, 1, 60); // IP de tu Raspberry Pi
const int udpPort = 6666;

// --- TIME CONFIGURATION (NTP) ---
const char* ntpServer = "pool.ntp.org";
const char* time_zone = "CET-1CEST,M3.5.0,M10.5.0/3";

// --- PIR & FLASH CONFIGURATION ---
#define PIR_PIN GPIO_NUM_13
#define WAIT_TIME_MS 60000
#define FLASH_PIN 4

// --- AI-Thinker Pins ---
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

RTSPServer rtspServer;
int quality = 12; 

// --- STATE MACHINE VARIABLES ---
enum SystemMode { MODE_AUTO, MODE_MANUAL };
SystemMode currentMode = MODE_AUTO; // Starts in auto mode

unsigned long firstDetection = 0; 
unsigned long lastActivity = 0;  
bool previousMotion = false; 

// --- OTA SERVER ---
WebServer server(80);
bool otaEnabled = false;

// --- SENDING LOGS FUNCTION ---
void remoteLog(String msg) {
  Serial.println(msg); 
  if (WiFi.status() == WL_CONNECTED) {
    udp.beginPacket(udpAddress, udpPort);
    udp.print(msg);
    udp.endPacket();
  }
}

// --- VIDEO TASK ---
void sendVideo(void* pvParameters) { 
  while (true) { 
    if(rtspServer.readyToSendFrame()) {
      camera_fb_t* fb = esp_camera_fb_get();
      if (fb) {
        rtspServer.sendRTSPFrame(fb->buf, fb->len, quality, fb->width, fb->height);
        esp_camera_fb_return(fb);
      }
    }
    vTaskDelay(pdMS_TO_TICKS(50)); 
  }
}

void printCurrentTime() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    remoteLog("  -> [Clock] Failed to obtain time from NTP server.");
    return;
  }
  char timeString[64];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
  remoteLog("  -> [Clock] Detection Date & Time: " + String(timeString));
}

// --- UDP COMMANDS LISTENER ---
void listenForCommands() {
  int packetSize = udp.parsePacket();
  if (packetSize) {
    char incoming[255];
    int len = udp.read(incoming, 255);
    if (len > 0) incoming[len] = 0;
    
    String command = String(incoming);
    command.trim(); // Clean invisible spaces or newlines

    if (command == "MODO:MANUAL") {
      currentMode = MODE_MANUAL;
      remoteLog("[SYSTEM] Changing to MANUAL Mode (PIR disabled).");
    } 
    else if (command == "MODO:AUTO") {
      currentMode = MODE_AUTO;
      lastActivity = millis(); // Reset timer
      remoteLog("[SYSTEM] Changing to AUTO Mode (PIR enabled).");
    }
    else if (command == "FLASH:ON" && currentMode == MODE_MANUAL) {
      remoteLog("[FLASH] Turning ON gradually...");
      for(int i = 0; i <= 30; i++) { 
        ledcWrite(FLASH_PIN, i); 
        delay(30); 
      }
    }
    else if (command == "FLASH:OFF" && currentMode == MODE_MANUAL) {
      remoteLog("[FLASH] Turning OFF gradually...");
      for(int i = 30; i >= 0; i--) {
        ledcWrite(FLASH_PIN, i); 
        delay(30);
      }
    }
    else if (command == "OTA:ON" && currentMode == MODE_MANUAL) {
      server.on("/", []() { server.send(200, "text/plain", "BuBird OTA Server Ready"); });
      ElegantOTA.begin(&server);
      server.begin();
      otaEnabled = true;
      remoteLog("[OTA] Server STARTED. Go to http://" + WiFi.localIP().toString() + "/update");
    }
    else if (command == "OTA:OFF" && otaEnabled) {
      server.stop();
      otaEnabled = false;
      remoteLog("[OTA] Server STOPPED.");
    }
    else if (command == "REBOOT" && currentMode == MODE_MANUAL) {
      remoteLog("[SYSTEM] REBOOT command received. Restarting...");
      delay(1000);
      ESP.restart();
    }
  }
}

void setup() {
  // --- BROWNOUT DETECTOR SHIELD (CRITICAL FOR FLASH) ---
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 

  Serial.begin(115200);
  delay(1000); 
  
  remoteLog("\n\n=================================");
  remoteLog("   Starting BuBird PIR v3.0      ");
  remoteLog("=================================");

  if (!psramFound()) {
    Serial.println("PSRAM not found. Restarting...");
  }

// --- FLASH SETUP (PWM - CORE v3.x) ---
  ledcAttach(FLASH_PIN, 5000, 8); // Pin, Frequency (5kHz), Resolution (8 bits)
  ledcWrite(FLASH_PIN, 0);        // Write directly to PIN, OFF by default

  // Configure PIR for wake up
  pinMode(PIR_PIN, INPUT);
  esp_sleep_enable_ext0_wakeup(PIR_PIN, 1); 

  remoteLog("[1/5] Configuring camera pins...");
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM; config.pin_d1 = Y3_GPIO_NUM; config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM; config.pin_d4 = Y6_GPIO_NUM; config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM; config.pin_d7 = Y9_GPIO_NUM; config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM; config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM; config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM; config.pin_reset = RESET_GPIO_NUM;
  
  config.xclk_freq_hz = 10000000; 
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_SVGA; 
  config.jpeg_quality = quality;
  config.fb_count = 2; 

  if (esp_camera_init(&config) != ESP_OK) { 
    remoteLog("[CRITICAL ERROR] Camera init failed. Restarting...");
    delay(3000);
    ESP.restart(); 
  }
  remoteLog("  -> Camera initialized successfully!");

  remoteLog("[2/5] Connecting to WiFi (" + String(ssid) + ")...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print(".");
  }
  remoteLog("\n  -> ESP connected to WiFi succesfully!");
  remoteLog("  -> ESP IP Assigned: " + WiFi.localIP().toString());
  
  remoteLog("[3/5] Synchronizing clock with Internet...");
  configTzTime(time_zone, ntpServer);
  delay(1000);
  printCurrentTime();

  remoteLog("[4/5] Starting RTSP Server & UDP Listener...");
  rtspServer.transport = RTSPServer::VIDEO_ONLY;
  rtspServer.init();
  udp.begin(udpPort); // Start listening for commands on port 6666

  remoteLog("[5/5] Starting video transmission task...");
  xTaskCreatePinnedToCore(sendVideo, "VideoTask", 1024 * 8, NULL, 1, NULL, 0); 
  
  remoteLog("=================================");
  remoteLog("          SYSTEM OK              ");
  remoteLog("=================================");
  
  firstDetection = millis(); 
  lastActivity = millis(); 
}

void loop() {
  // 1. Always listen for remote commands
  listenForCommands();

  // 2. Process OTA Server request if enabled
  if (otaEnabled) {
    server.handleClient();
    ElegantOTA.loop();
  }

  // 3. Logic based on Operation Mode
  if (currentMode == MODE_AUTO) {
    bool motionDetected = digitalRead(PIR_PIN);

    if (motionDetected == HIGH) {
      lastActivity = millis(); 
      
      if (!previousMotion) { 
        struct tm timeinfo;
        String timeStamp = "";
        
        if(getLocalTime(&timeinfo)) {
          char timeString[64];
          strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
          timeStamp = "[" + String(timeString) + "] ";
        }
        
        remoteLog(timeStamp + "[PIR] Motion detected! Keeping system active...");
        previousMotion = true;
      }
    } else {
      previousMotion = false;
    }

    if (millis() - lastActivity > WAIT_TIME_MS) {
      unsigned long presenceSeconds = (lastActivity - firstDetection) / 1000;
      remoteLog("\n=================================");
      remoteLog("[STATS] Total presence time in nest: " + String(presenceSeconds) + " seconds.");
      remoteLog("=================================");
      remoteLog("[SLEEP] 1 minute without motion. Entering Deep Sleep... Zzz");
      delay(1000);
      esp_deep_sleep_start(); 
    }
  }
  // In MODE_MANUAL, the loop simply ignores PIR and keeps the camera alive.

  // 4. WiFi security check
  if (WiFi.status() != WL_CONNECTED) { 
    remoteLog("\n[ERROR] WiFi connection lost. Restarting to recover...");
    delay(2000);
    ESP.restart(); 
  }

  vTaskDelay(pdMS_TO_TICKS(100)); // Short delay so commands respond quickly
}