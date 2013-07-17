"use strict";

function formCheck(form) {
  var wifi_ssid = form["wifi.ssid"];
  var wifi_encryption = form["wifi.encryption"];
  var wifi_password = form["wifi.password"];
  var hostname = form["hostname"];
  var password = form["password"];
  var errors;

  var errContainer = document.getElementById("error_response");

  errContainer.innerHTML = "";
  errors = false;

  wifi_password.className = "normal";
  wifi_ssid.className = "normal";
  hostname.className = "normal";
  password.className = "normal";
  errContainer.className = "hidden";

  function nullOrEmpty(val) {
    return val == null || val === "";
  }

  if (!wifi_ssid.disabled && nullOrEmpty(wifi_ssid.value)) {
    errorHandler(wifi_ssid, errContainer, "Please choose a WiFi network name");
    errors = true;
  }

  if (!wifi_password.disabled && wifi_encryption.value != "none") {
    if (nullOrEmpty(wifi_password.value)) {
      errorHandler(wifi_password, errContainer, "Please choose a WiFi password");
      errors = true;
    } else if (wifi_password.value.length < 8) {
      errorHandler(wifi_password, errContainer, "WiFi password should be 8 char at least");
      errors = true;
    }
  }

  if (nullOrEmpty(hostname.value)) {
    errorHandler(hostname, errContainer, "Please choose a name for your Y&uacute;n");
    errors = true;

  } else if (hostname.value.match(/[^a-zA-Z0-9]/)) {
    errorHandler(hostname, errContainer, "Incorrect hostname: you can use only characters between a and z and numbers");
    errors = true;
  }

  if (password.value != null && password.value != "" && password.value.length < 8) {
    errorHandler(password, errContainer, "Password should be 8 char at least");
    errors = true;
  }

  return !errors;
}

function formReset() {
  setTimeout(function() {
    grey_out_wifi_conf(!document.getElementById("wificheck").checked);
    onchange_security(document.getElementById("wifi_encryption"));
  }, 100);
}

function errorHandler(el, er, msg) {
  el.className = "error";
  er.className = "visible";
  er.innerHTML = "<p>" + er.innerHTML + msg + "<br /></p>";
}

function goto(href) {
  document.location = href;
  return false;
}

function onchange_security(select) {
  var wifi_pass_container = document.getElementById("wifi_password_container");
  var wifi_pass = document.getElementById("wifi_password");
  if (select.value == "none") {
    wifi_pass_container.setAttribute("class", "hidden");
  } else {
    wifi_pass_container.removeAttribute("class");
    wifi_pass.value = "";
    wifi_pass.focus();
  }
}

var pu, key_id, public_key;
if (typeof(getPublicKey) === "function") {
  pu = new getPublicKey(pub_key);
  key_id = pu.keyid;
  public_key = pu.pkey.replace(/\n/g, "");
}

function send_post(url, form, real_form_id) {
  var json = {};
  for (var i = 3; i < arguments.length; i++) {
    if (!form[arguments[i]].disabled) {
      json[arguments[i]] = form[arguments[i]].value;
    }
  }
  var pgp_message = doEncrypt(key_id, 0, public_key, JSON.stringify(json));
  var real_form = document.getElementById(real_form_id);
  real_form.pgp_message.value = pgp_message;
  real_form.submit();
  return false;
}

function grey_out_wifi_conf(disabled) {
  if (disabled) {
    document.getElementById("wifi_container").setAttribute("class", "disabled");
  } else {
    document.getElementById("wifi_container").setAttribute("class", "");
  }
  document.getElementById("wifi_password").disabled = disabled;
  document.getElementById("wifi_ssid").disabled = disabled;
  document.getElementById("wifi_encryption").disabled = disabled;
  document.getElementById("detected_wifis").disabled = disabled;
}

function matchpassword() {
  var confpassword = document.getElementById("confpassword");
  var password = document.getElementById("password");
  if (confpassword.value == password.value) {
    document.getElementById("pass_mismatch").setAttribute("class", "hidden error_container input_message");
  } else {
    document.getElementById("pass_mismatch").setAttribute("class", "error_container input_message");
  }
}

document.body.onload = function() {
  if (document.getElementById("username")) {
    document.getElementById("password").focus();
  }
  if (document.getElementById("wificheck")) {
    document.getElementById("wificheck").onclick = function(event) {
      grey_out_wifi_conf(!event.target.checked);
    }
  }
  if (document.getElementById("wifi_encryption")) {
    document.getElementById("wifi_encryption").onchange = function(event) {
      onchange_security(event.target);
    }
  }
  if (document.getElementById("confpassword")) {
    document.getElementById("confpassword").onkeyup = function(event) {
      matchpassword(event.target);
    };
    document.getElementById("password").onkeyup = function(event) {
      matchpassword(event.target);
    }
  }

  if (document.getElementById("detected_wifis")) {
    var detect_wifi_networks = function() {
      var detected_wifis = $("#detected_wifis");
      if (detected_wifis[0].disabled) {
        return false;
      }
      detected_wifis.empty();
      detected_wifis.append("<option>Detecting ...</option>");
      $.get(refresh_wifi_url, function(wifis) {
        detected_wifis.empty();
        detected_wifis.append("<option>Select a wifi network...</option>");
        for (var idx = 0; idx < wifis.length; idx++) {
          var html = "<option value=\"" + wifis[idx].name + "|||" + wifis[idx].encryption + "\">" + wifis[idx].name;
          if (wifis[idx].encryption !== "none") {
            html = html + " (" + wifis[idx].pretty_encryption + ")";
          }
          html = html + "</option>";
          detected_wifis.append(html);
        }
      });
      return false;
    };
    document.getElementById("refresh_detected_wifis").onclick = detect_wifi_networks;

    document.getElementById("detected_wifis").onchange = function() {
      var parts = $("#detected_wifis").val().split("|||");
      if (parts.length !== 2) {
        return;
      }
      $("#wifi_ssid").val(parts[0]);
      $("#wifi_encryption").val(parts[1]);
      $("#wifi_encryption").change();
    };
    detect_wifi_networks();
  }
};
