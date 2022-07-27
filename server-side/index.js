#!/usr/bin/env node

const WebSocketServer = require("websocket").server;
const { webcrypto } = require("crypto");
const http = require("http");
const port = process.env.PORT || 8011;
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

function log(...args) {
  console.log(moment().format("YYYY/MM/DD HH:mm:ss -"), ...args);
}
function getUUID() {
  return uuidv4().split("-").join("");
}
// Create server
const server = http.createServer(function (request, response) {
  log("Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

//  Setup listening
server.listen(port, function () {
  log("Server is listening on port " + port);
});

wsServer = new WebSocketServer({
  httpServer: server,
});

function clientAuth(msg) {
  let clientConnect = clientList[msg.name];
  if (clientConnect && clientConnect.sessionId === msg.sessionId) {
    return true;
  }
  return false;
}

const ESP8266_AUTH = "0DF94E58B2524498BAA43F8B01FC6A7C";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";
const ESPApprovedList = {
  // TVRemote1: {
  //   name: "",
  //   sessionId: "",
  //   createdDatetime: new Date(),
  //   connection: {},
  // },
  // TVRemote2: {
  //   name: "",
  //   sessionId: "",
  //   createdDatetime: new Date(),
  //   connection: {},
  // },
  // Projector1: {
  //   name: "",
  //   sessionId: "",
  //   createdDatetime: new Date(),
  //   connection: {},
  // },
  // Projector2: {
  //   name: "",
  //   sessionId: "",
  //   createdDatetime: new Date(),
  //   connection: {},
  // },
};

const temporarySessionList = {
  sessionId: {
    createdDatetime: new Date(),
    expiredDatetime: new Date(),
  },
};

const webClientApprovedList = {
  deviceId: {
    sessionId: "",
    isTemporarySession: false,
    connection: {},
    expiredDatetime: new Date(),
    createdDatetime: new Date(),
    listDevice: [],
  },
};

const TYPE_ESP = "esp8266";
const TYPE_WEB = "webclient";
const TYPE_PI = "piclient";

function originIsAllowed(req) {
  // put logic here to detect whether the specified origin is allowed.
  const approveList = [TYPE_ESP, TYPE_WEB];
  const protocol = req.requestedProtocols[0];
  return approveList.includes(protocol);
}

// Initial Connect
wsServer.on("request", function (request) {
  const requestType = request.requestedProtocols[0];
  if (!originIsAllowed(request)) {
    request.reject();
    console.log(
      new Date() +
        " Connection from origin " +
        request.origin +
        " rejected. requestProtocol" +
        request.requestedProtocols[0]
    );
    return;
  }

  const connection = request.accept(requestType, null);
  log("Request is established: " + requestType);

  connection.on("message", function (message) {
    handleMessage(connection, message, requestType);
  });

  connection.on("close", function (reasonCode, description) {
    handleClose(connection, requestType);
  });
});

function handleMessage(conn, msg, type) {
  switch (type) {
    case TYPE_ESP:
      handleESPMessage(conn, msg);
      break;
    case TYPE_WEB:
      handleWebMessage(conn, msg);
      break;
  }
}

function handleESPMessage(conn, msg) {
  const msgContent = msg.utf8Data.split(":");
  // Auth
  if (msgContent.length > 0 && msgContent[0] === "auth") {
    if (msgContent[2] === ESP8266_AUTH) {
      ESPApprovedList[msgContent[1]] = {
        connection: conn,
        name: msgContent[1],
        sessionId: ESP8266_AUTH,
      };
      conn.deviceId = msgContent[1];
      conn.sendUTF("PermissionAccepted");
    } else {
      conn.sendUTF("PermissionDenied");
      conn.close();
    }
  }
}

function handleWebMessage(conn, msg) {
  const msgObj = JSON.parse(msg.utf8Data);
  // client auth
  if (msgObj.type === "login") {
    handleWebLogin(conn, msgObj);
  }

  if (msgObj.type === "sendIRSignal") {
    handleIrSignalRequest(conn, msgObj);
  }

  if (msgObj.type === "getTemporaryConnection") {
    handleTemporaryConnection(conn, msgObj);
  }
}
function handleIrSignalRequest(conn, msg) {
  if (!isValidWebClientAuth(msg)) {
    // do nothing
  }

  try {
    var espConn = ESPApprovedList[msg.espDeviceName];
    if (espConn.connection && msg.value) {
      espConn.connection.sendUTF(msg.value);
    }
  } catch (e) {}
}

function getListDevice() {
  let listDevice = [];
  for (let item in ESPApprovedList) {
    listDevice.push(item);
  }
  listDevice.sort();
  return listDevice;
}

function isValidWebClientAuth(msg) {
  if (!msg.deviceId && !msg.sessionId) {
    return false;
  }
  const approvedConn = webClientApprovedList[msg.deviceId];
  if (
    approvedConn &&
    approvedConn.sessionId === msg.sessionId &&
    approvedConn.listDevice.includes(msg.espDeviceName)
  ) {
    return true;
  }
  return false;
}

function handleTemporaryConnection(conn, msg) {
  if (!isValidWebClientAuth(msg)) {
    // do nothing
  }
  try {
    console.log("handle temporary session", msg.listDevice);
    var randomSessionId = getUUID();
    temporarySessionList[randomSessionId] = {
      createdDatetime: new Date(),
      expiredDatetime: initExpireDate(),
      listDevice: msg.listDevice,
    };

    conn.sendUTF(
      JSON.stringify({
        type: "getTemporaryConnection",
        temporarySession: randomSessionId,
      })
    );
  } catch (e) {}
}

function handleWebLogin(conn, msg) {
  // handle temporary session
  if (msg.isTemporarySession) {
    console.log("handle temporary session", msg.listDevice);
    const session = temporarySessionList[msg.sessionId];
    if (session && session.expiredDatetime > Date.now()) {
      // push connection info into stack
      webClientApprovedList[msg.deviceId] = {
        sessionId: msg.sessionId,
        connection: conn,
        expiredDatetime: session.expiredDatetime,
        listDevice: session.listDevice,
        isTemporarySession: true,
      };

      conn.sendUTF(
        JSON.stringify({
          type: "login",
          result: "accepted",
          sessionId: msg.sessionId,
          deviceId: msg.deviceId,
          expiredDatetime: session.expiredDatetime,
          listDevice: session.listDevice,
        })
      );

      conn.deviceId = msg.deviceId;

      return;
    }
  }

  // handle login by deviceId, session Id
  if (msg.deviceId && msg.sessionId) {
    const approvedConn = webClientApprovedList[msg.deviceId];
    if (approvedConn && approvedConn.expiredDatetime > Date.now()) {
      conn.sendUTF(
        JSON.stringify({
          type: "login",
          result: "accepted",
          sessionId: msg.sessionId,
          username: approvedConn.username,
          deviceId: msg.deviceId,
          expiredDatetime: initExpireDate(),
          listDevice: getListDevice(),
        })
      );
      conn.deviceId = msg.deviceId;
    } else {
      sendRejectMsg(conn);
    }
    return;
  }

  // handle login by username, password
  if (msg.username === ADMIN_USERNAME && msg.password === ADMIN_PASSWORD) {
    log("Request is accepted.");
    // accept connect
    const uuid = getUUID();
    const expiredDate = initExpireDate();
    conn.sendUTF(
      JSON.stringify({
        type: "login",
        result: "accepted",
        sessionId: uuid,
        username: msg.username,
        deviceId: msg.deviceId,
        expiredDatetime: expiredDate,
        listDevice: getListDevice(),
      })
    );

    // push connection info into stack
    webClientApprovedList[msg.deviceId] = {
      username: msg.username,
      sessionId: uuid,
      connection: conn,
      expiredDatetime: expiredDate,
      listDevice: getListDevice(),
    };
    conn.deviceId = msg.deviceId;
  } else {
    log("Request is rejected.");
    sendRejectMsg(conn);
  }
}

function sendRejectMsg(conn) {
  conn.sendUTF(
    JSON.stringify({
      type: "login",
      result: "rejected",
    })
  );
}

function handleClose(conn, type) {
  switch (type) {
    case TYPE_ESP:
      espConn = null;
      break;
    case TYPE_WEB:
      webConn = null;
      break;
  }
  log("device named " + conn.deviceId + " is disconnected.");
  delete ESPApprovedList[conn.deviceId];
}

function initExpireDate() {
  return Date.now() + 60 * 60 * 1000;
}
