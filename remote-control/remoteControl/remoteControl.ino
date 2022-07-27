/*
 * RemoteControl.ino
 * https://github.com/Links2004/arduinoWebSockets
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <WebSocketsClient.h>
#include <IRremote.h>

#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

// int gpio0_pin = 0;
int gpio3_pin = 3;

const char* ssid = "AnhPhone";          // your ssid
const char* password = "12345678";      // your password
const char* socketUrl = "misr-remote.herokuapp.com";  // misr-remote.herokuapp.com
const char* deviceName = "Projector2";  // deviceName TVRemote1, Projector2
const char* sessionId = "0DF94E58B2524498BAA43F8B01FC6A7C"; // sample sessionId
char* authMsg = "auth:Projector2:0DF94E58B2524498BAA43F8B01FC6A7C"; // sample auth
const int port = 80;      // open port // 80
const char* PERMISSION_DENIED = "PermissionDenied";
const char* PERMISSION_ACCEPTED = "PermissionAccepted";
IRsend irsend(gpio3_pin);

boolean compareString(uint8_t * input, char * comparator) {
  String strInput = (char *) input;
  if(strInput == comparator) return true;
  return false;
}

void sendIrRequest(uint8_t * input) {

  // FOR PROJECTOR
  if(compareString(input,"BTN_PROJECTOR_MUTE")) {irsend.sendNEC(0x1D78877,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_POWER")) {irsend.sendNEC(0x1D748B7,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_AUTOSET")) {irsend.sendNEC(0x1D7A857,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_INPUT")) {irsend.sendNEC(0x1D728D7,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_UP")) {irsend.sendNEC(0x1D702FD,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_LEFT")) {irsend.sendNEC(0x1D742BD,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_RIGHT")) {irsend.sendNEC(0x1D7C23D,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_DOWN")) {irsend.sendNEC(0x1D7827D,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_OK")) {irsend.sendNEC(0x1D7C837,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_MENU")) {irsend.sendNEC(0x1D7D827,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_ECO")) {irsend.sendNEC(0x1D714EB,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_SIZE_UP")) {irsend.sendNEC(0x1D7E01F,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_SIZE_DOWN")) {irsend.sendNEC(0x1D724DB,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_VOLUME_DOWN")) {irsend.sendNEC(0x1D7C03F,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_VOULME_UP")) {irsend.sendNEC(0x1D7609F,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_ONE")) {irsend.sendNEC(0x1D704FB,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_TWO")) {irsend.sendNEC(0x1D754AB,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_THREE")) {irsend.sendNEC(0x1D7847B,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_FOUR")) {irsend.sendNEC(0x1D734CB,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_FIVE")) {irsend.sendNEC(0x1D7D42B,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_SIX")) {irsend.sendNEC(0x1D75AA5,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_SEVEN")) {irsend.sendNEC(0x1D7E41B,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_EIGHT")) {irsend.sendNEC(0x1D7A25D,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_NINE")) {irsend.sendNEC(0x1D720DF,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_ZERO")) {irsend.sendNEC(0x1D732CD,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_BLANK")) {irsend.sendNEC(0x1D7C43B,32);   return;}
  else if(compareString(input,"BTN_PROJECTOR_MHL")) {irsend.sendNEC(0x1D7B24D,32);   return;}

  // FOR REMOTE
  else if(compareString(input,"BTN_REMOTE_CHANGE")) {irsend.sendNEC(0x2FDF00F,32); return;}
  else if(compareString(input,"BTN_REMOTE_CS")) {irsend.sendNEC(0x2FDBE41,32); return;}
  else if(compareString(input,"BTN_REMOTE_POWER")) {irsend.sendNEC(0x2FD48B7,32); return;}
  else if(compareString(input,"BTN_REMOTE_ANA")) {irsend.sendNEC(0x2FDDE21,32); return;}
  else if(compareString(input,"BTN_REMOTE_DIGI")) {irsend.sendNEC(0x2FD5EA1,32); return;}
  else if(compareString(input,"BTN_REMOTE_BS")) {irsend.sendNEC(0x2FD3EC1,32); return;}
  else if(compareString(input,"BTN_REMOTE_ONE")) {irsend.sendNEC(0x2FD807F,32); return;}
  else if(compareString(input,"BTN_REMOTE_TWO")) {irsend.sendNEC(0x2FD40BF,32); return;}
  else if(compareString(input,"BTN_REMOTE_THREE")) {irsend.sendNEC(0x2FDC03F,32); return;}
  else if(compareString(input,"BTN_REMOTE_FOUR")) {irsend.sendNEC(0x2FD20DF,32); return;}
  else if(compareString(input,"BTN_REMOTE_FIVE")) {irsend.sendNEC(0x2FDA05F,32); return;}
  else if(compareString(input,"BTN_REMOTE_SIX")) {irsend.sendNEC(0x2FD609F,32); return;}
  else if(compareString(input,"BTN_REMOTE_SEVEN")) {irsend.sendNEC(0x2FDE01F,32); return;}
  else if(compareString(input,"BTN_REMOTE_EIGHT")) {irsend.sendNEC(0x2FD10EF,32); return;}
  else if(compareString(input,"BTN_REMOTE_NINE")) {irsend.sendNEC(0x2FD906F,32); return;}
  else if(compareString(input,"BTN_REMOTE_TEN")) {irsend.sendNEC(0x2FD50AF,32); return;}
  else if(compareString(input,"BTN_REMOTE_ELEVENT")) {irsend.sendNEC(0x2FDD02F,32); return;}
  else if(compareString(input,"BTN_REMOTE_TWELVE")) {irsend.sendNEC(0x2FD30CF,32); return;}
  else if(compareString(input,"BTN_REMOTE_CHANNEL_UP")) {irsend.sendNEC(0x2FDD827,32); return;}
  else if(compareString(input,"BTN_REMOTE_RESET")) {irsend.sendNEC(0x2FDF00F,32); return;}
  else if(compareString(input,"BTN_REMOTE_VOL_UP")) {irsend.sendNEC(0x2FD58A7,32); return;}
  else if(compareString(input,"BTN_REMOTE_CHANNEL_DOWN")) {irsend.sendNEC(0x2FDF807,32); return;}
  else if(compareString(input,"BTN_REMOTE_VOL_DOWN")) {irsend.sendNEC(0x2FD7887,32); return;}
  else if(compareString(input,"BTN_REMOTE_REGZA")) {irsend.sendNEC(0x27D2CD3,32); return;}
  else if(compareString(input,"BTN_REMOTE_UP")) {irsend.sendNEC(0x2FD7C83,32); return;}
  else if(compareString(input,"BTN_REMOTE_SCHEDULE")) {irsend.sendNEC(0x2FD7689,32); return;}
  else if(compareString(input,"BTN_REMOTE_LEFT")) {irsend.sendNEC(0x2FDFA05,32); return;}
  else if(compareString(input,"BTN_REMOTE_OK")) {irsend.sendNEC(0x2FDBC43,32); return;}
  else if(compareString(input,"BTN_REMOTE_RIGHT")) {irsend.sendNEC(0x2FDDA25,32); return;}
  else if(compareString(input,"BTN_REMOTE_BACK")) {irsend.sendNEC(0x2FDDC23,32); return;}
  else if(compareString(input,"BTN_REMOTE_DOWN")) {irsend.sendNEC(0x2FDFC03,32); return;}
  else if(compareString(input,"BTN_REMOTE_END")) {irsend.sendNEC(0x2FD3CC3,32); return;}
  
  // FOR TESTING
  else if(compareString(input,"LIGHT_ON")) {irsend.sendNEC(0x41B6659A,32);   return;}
  else if(compareString(input,"LIGHT_OFF")) {irsend.sendNEC(0x41B67D82,32);   return;}
  else if(compareString(input,"LIGHT_DIM")) {irsend.sendNEC(0x41B63DC2,32);   return;}
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      USE_SERIAL.printf("[Websocket] Disconnected!\n");
      USE_SERIAL.printf("[Websocket] reconnect ...\n");
      delay(1000);
      webSocket.begin(socketUrl, port, "/", "esp8266");
      webSocket.onEvent(webSocketEvent);
      break;

    case WStype_CONNECTED: 
      USE_SERIAL.printf("[Websocket] Connected to url: %s\n", payload);
      webSocket.sendTXT("[Websocket] Connected");
      webSocket.sendTXT(authMsg);
      break;

    case WStype_TEXT:
      USE_SERIAL.printf("[Websocket] Get text: %s\n", payload);
      if(strcmp((char *)payload, PERMISSION_DENIED) == 0) {
        USE_SERIAL.printf("Connect is rejected by server.\n");
        USE_SERIAL.printf("Reconnect in 10s...\n");
        delay(10000);
      }else if(strcmp((char *)payload, PERMISSION_ACCEPTED) == 0) {
        USE_SERIAL.printf("Connect is accepted by server.\n");
      }else{
        sendIrRequest(payload);
      }
      break;
  }
}

void setup() {
  
  // preparing GPIOs
  // pinMode(gpio0_pin, OUTPUT);
  // digitalWrite(gpio0_pin, LOW);
  pinMode(gpio3_pin, OUTPUT);
  digitalWrite(gpio3_pin, LOW);
  delay(1000);

  USE_SERIAL.begin(115200);
  // USE_SERIAL.setDebugOutput(true);

  for(uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  WiFiMulti.addAP(ssid, password);

  while(WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  // server address, port and URL
  webSocket.begin(socketUrl, port, "/", "esp8266");
  
  // event handler
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  delay(200);
}
