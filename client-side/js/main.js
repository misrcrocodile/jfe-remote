"use restrict";
var isDev = true;
var screenName = getScreenName();
var wsHostName = "wss://misr-remote.herokuapp.com"; // ws://localhost:8011

// Initializing random deviceId
var deviceId = "";
if (localStorage.getItem("deviceId") === null) {
  deviceId = makeID(8);
  localStorage.setItem("deviceId", deviceId);
} else {
  deviceId = localStorage.getItem("deviceId");
}

/**
 * Setting up Connection to server
 */
// Initializing connection
var connection = new WebSocket(wsHostName, ["webClient"]);

// Handling on open
connection.onopen = function () {
  log("onopen: localStorage: ", localStorage);
  var username = localStorage.getItem("username");
  var sessionId = localStorage.getItem("sessionId");
  var deviceId = localStorage.getItem("deviceId");
  var isTemporarySession = localStorage.getItem("isTemporarySession");

  log("onopen", { username, sessionId, deviceId });
  var searchParam = new URLSearchParams(window.location.search);
  if (searchParam.has("temporarySession")) {
    sessionId = searchParam.get("temporarySession");
    isTemporarySession = true;
    username = "";
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("isTemporarySession", isTemporarySession);
    localStorage.setItem("username", username);
  }
  if (sessionId === null) {
    if (!isLoginPage()) {
      alert("Session is expired. Redirect to login page.");
      redirect("index");
    }
  } else {
    var msgData = JSON.stringify({
      type: "login",
      username: username,
      deviceId: deviceId,
      sessionId: sessionId,
      isTemporarySession: isTemporarySession,
    });
    log("msgData1: ", msgData);
    connection.send(msgData);
  }
};

// Handling on Error
connection.onerror = function (error) {
  log("WebSocket Error ", error);
  alert("Cannot connect to server.");
};

// Handling on Close
connection.onclose = function (e) {
  var isReload = confirm("Server connection lost. Try again?");
  if (isReload) {
    location.reload();
  }
};

// Handling on Message
connection.onmessage = function (e) {
  log("on message");
  var msg = JSON.parse(e.data);
  log("on messageData:", msg);
  if (msg.type === "login") {
    handleLogin(msg);
  } else if (msg.type === "getTemporaryConnection") {
    handleTemporaryConnection(msg);
  }
};

setTimeout(initURLGeneratorDialog, 2000);

// init checkbox

/**
 * handle when screen initialize
 * @param {*} msg
 */
function handleLogin(msg) {
  if (msg.result === "accepted") {
    log("Connect to server is accepted. ScreenName:", getScreenName());
    var listDevice = msg.listDevice;
    localStorage.setItem("sessionId", msg.sessionId);
    localStorage.setItem("listDevice", listDevice);
    localStorage.setItem("expiredDatetime", msg.expiredDatetime);
    localStorage.setItem("username", msg.username);
    // redirect from login to remote page
    if (listDevice.length === 0) {
      localStorage.clear();
      alert("There are no connected device.");
    } else {
      if (isLoginPage()) {
        log("From loginpage redirect to: ", listDevice[0]);
        redirect(listDevice[0]);
      } else {
        log("Device List: ", listDevice);
        initOptionList(listDevice, screenName);
      }
    }
  } else {
    var errorMsg = isLoginPage() ? "Password is incorrect." : "";
    onOutOfSession(errorMsg);
    onLogout();
  }
}

/**
 * handle when session is running out
 * @param {String} msg
 */
function onOutOfSession(msg) {
  localStorage.clear();
  alert(msg || "Session Timeout, move to login page");
}

/**
 * Send login request when click login button
 */
function onLogin() {
  username = document.getElementById("usernameTxtbox").value;
  password = document.getElementById("passwordTxtbox").value;
  connection.send(
    JSON.stringify({
      type: "login",
      username: username,
      password: password,
      deviceId: deviceId,
    })
  );
}

/**
 * Logout method
 */
function onLogout() {
  localStorage.clear();
  redirect("index");
}

/**
 *  Send Signal to ESP device
 * @param {String} item
 */
function sendRequest(item) {
  var type = "sendIRSignal";
  var deviceId = localStorage.getItem("deviceId");
  var espDeviceName = document.getElementById("ESPDeviceSelector").value;
  var sessionId = localStorage.getItem("sessionId");
  var value = item.value;
  var msg = JSON.stringify({
    type: type,
    deviceId: deviceId,
    espDeviceName: espDeviceName,
    sessionId: sessionId,
    value: value,
  });
  log("Send Request:", value);
  connection.send(msg);
  document.activeElement.blur();
}

/**
 * Redirect to device screen
 * @param {String} deviceName
 */
function redirect(deviceName) {
  log("Redirect to", deviceName);
  var redirectUrl = document.location.href;
  var urlPart = redirectUrl.split("/");
  urlPart[urlPart.length - 1] = deviceName + ".html";
  document.location.href = urlPart.join("/");
}

/**
 * Create device pulldown list
 * @param {List<String>} deviceList
 * @param {String} screenName
 */
function initOptionList(deviceList, screenName) {
  var selector = document.getElementById("ESPDeviceSelector");
  if (selector !== null) {
    selector.innerHTML = "";
  }
  for (const deviceName of deviceList) {
    var option = document.createElement("option");
    option.value = deviceName;
    option.text = deviceName;
    if (screenName === deviceName) {
      option.selected = true;
    }
    selector.appendChild(option);
  }
}
/**
 * Handle device pulldown on change action;
 */
function onDeviceSelect(e) {
  redirect(e.value);
}

/**
 * Getting screen name
 * @returns screenName
 */
function getScreenName() {
  var href = document.location.href;
  var urlPart = href.split("/");
  var name = urlPart[urlPart.length - 1];
  return name.split(".")[0];
}

/**
 * Creating UUID by setting length
 * @param {integer} length
 * @returns
 */
function makeID(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * checking page is login page or not
 */
function isLoginPage() {
  return document.location.href.includes("index");
}

/**
 * Creating HTML element
 */
function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

function initURLGeneratorDialog() {
  log("initURLGeneratorDialog");

  var listItem = [];
  // get list device
  var listDeviceEl = document.getElementById("ESPDeviceSelector");
  if (listDeviceEl === null) {
    return;
  }
  for (var device of listDeviceEl) {
    listItem.push(device.value);
  }
  // init parent
  var parent = document.getElementById("modalDeviceList");
  if (parent != null) {
    parent.innerHTML = "";
  }
  // create checkbox list
  for (var i = 0; i < listItem.length; i++) {
    addCheckboxItem(listItem[i]);
  }
}

function addCheckboxItem(elementId) {
  var parent = document.getElementById("modalDeviceList");
  var el = createElementFromHTML(`<div class="form-check">
  <input class="form-check-input" type="checkbox" value="" id="${elementId}">
  <label class="form-check-label" for="flexCheckDefault">
  ${elementId}
  </label>
</div>`);
  parent.appendChild(el);
}

function generateCode() {
  var listDeviceEls = document
    .getElementById("modalDeviceList")
    .getElementsByTagName("input");
  var listDevice = [];
  for (var i = 0; i < listDeviceEls.length; i++) {
    if (listDeviceEls[i].checked) {
      listDevice.push(listDeviceEls[i].id);
    }
  }
  if (listDevice.length === 0) {
    alert("Please select at least one device.");
    return;
  }
  connection.send(
    JSON.stringify({
      type: "getTemporaryConnection",
      listDevice: listDevice,
    })
  );
}

function handleTemporaryConnection(msg) {
  var el = document.getElementById("generatedUrl");
  el.value =
    window.location.origin +
    window.location.pathname +
    "?temporarySession=" +
    msg.temporarySession;
}
function showDialog() {
  // remove textbox item
  var generatedURLEl = document.getElementById("generatedUrl");
  generatedURLEl.value = "";
  var myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {
    keyboard: false,
  });
  myModal.toggle();
}

function log(...arg) {
  if (isDev) {
    console.log(...arg);
  }
}
