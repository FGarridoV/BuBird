import os
import json
import socket
import threading

from http.server import BaseHTTPRequestHandler, HTTPServer

# --- Configuration ---
UDP_IP = "0.0.0.0"
UDP_PORT = 6666
HTTP_PORT = 5000
LOG_FILE = "/www/logs.txt"
MAX_LOG_LINES = 100
PASSWORD = "nido"

# ESP32 IP address (optional)
esp32_ip = "192.168.1.61"


def save_log(message: str) -> None:
    """Saves the message maintaining a 50-line limit"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            logs = f.readlines()
            
    logs.append(message + "\n")
    if len(logs) > MAX_LOG_LINES: logs = logs[-MAX_LOG_LINES:]
        
    with open(LOG_FILE, "w") as f:
        f.writelines(logs)


def udp_listener():
    """Listens for UDP messages from the ESP32 and saves them to the log file."""
    global esp32_ip

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"[UDP SERVER] UDP Listener started on port {UDP_PORT}")
    
    while True:
        data, addr = sock.recvfrom(1024)
        try:
            msg = data.decode('utf-8').strip()
            if msg:
                esp32_ip = addr[0]
                save_log(msg)
        except Exception as e:
            print(f"[UDP SERVER] Error decoding data: {e}")



class APIHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Allows communication between the browser (port 80) and the API (port 5000)"""
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


    def do_POST(self):
        """Handles POST requests to control the camera."""
        global esp32_ip

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            req = json.loads(post_data.decode('utf-8'))
            
            # 1. CHECK PASSWORD
            if req.get('password') != PASSWORD:
                self.wfile.write(json.dumps({"status": "error", "message": "Invalid password"}).encode('utf-8'))
                return

            command = req.get('command')
            
            # 2. CHECK IF ESP32 IP IS KNOWN
            if command and esp32_ip:
                send_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                send_sock.sendto(command.encode('utf-8'), (esp32_ip, 6666))
                
                print(f"Command sent to {esp32_ip}: {command}")
                save_log(f"-> [Web Control] Command issued: {command}")
                
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({"status": "error", "message": "Camera not detected yet"}).encode('utf-8'))
                
        except Exception as e:
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

    # Silence the default logging to avoid cluttering the console
    def log_message(self, format, *args):
        pass


def start_http_server():
    """Starts the HTTP server to listen for control commands."""
    server = HTTPServer(('0.0.0.0', HTTP_PORT), APIHandler)
    print(f"[HTTP API Server] started on port {HTTP_PORT}")
    server.serve_forever()



if __name__ == '__main__':
    save_log("-> [System] Communications server updated & started...")
    threading.Thread(target=udp_listener, daemon=True).start()
    start_http_server()
