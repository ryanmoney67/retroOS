dragElement(document.getElementById("welcome"));
dragElement(document.getElementById("paint"));
dragElement(document.getElementById("terminal"));

function dragElement(element) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;

  if (document.getElementById(element.id + "header")) {
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + "px";
    element.style.left = (element.offsetLeft - currentX) + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function closeWindow(element) {
  element.style.display = "none";
}

function openWindow(element) {
  element.style.display = "flex";
}

var taskbar = document.querySelector("#taskbar");
var openApps = {};

function registerApp(windowId, label) {
  var win = document.getElementById(windowId);

  var taskbarButton = document.createElement("div");
  taskbarButton.textContent = label;
  taskbarButton.style.padding = "4px 12px";
  taskbarButton.style.border = "2px outset #ffffff";
  taskbarButton.style.backgroundColor = "#c0c0c0";
  taskbarButton.style.cursor = "pointer";
  taskbarButton.style.display = "none";
  taskbar.appendChild(taskbarButton);

  taskbarButton.addEventListener("click", function() {
    if (win.style.display === "none") {
      win.style.display = "flex";
    } else {
      win.style.display = "none";
    }
    bringToFront(win);
  });

  openApps[windowId] = taskbarButton;
}

function showInTaskbar(windowId) {
  if (openApps[windowId]) {
    openApps[windowId].style.display = "block";
  }
}

function hideFromTaskbar(windowId) {
  if (openApps[windowId]) {
    openApps[windowId].style.display = "none";
  }
}

var topZ = 10;
function bringToFront(win) {
  topZ++;
  win.style.zIndex = topZ;
}

function minimizeWindow(windowId) {
  document.getElementById(windowId).style.display = "none";
}

var welcomeScreen = document.querySelector("#welcome");
var welcomeScreenClose = document.querySelector("#welcomeclose");
var welcomeScreenOpen = document.querySelector("#welcomeopen");

registerApp("welcome", "📟 retroOS");

welcomeScreenClose.addEventListener("click", function() {
  closeWindow(welcomeScreen);
  hideFromTaskbar("welcome");
});

welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
  bringToFront(welcomeScreen);
  showInTaskbar("welcome");
});

document.querySelector("#welcomeminimize").addEventListener("click", function() {
  minimizeWindow("welcome");
});

welcomeScreen.addEventListener("mousedown", function() {
  bringToFront(welcomeScreen);
});

showInTaskbar("welcome");

function updateTime() {
  var currentTime = new Date().toLocaleTimeString();
  var timeText = document.querySelector("#timeElement");
  timeText.innerHTML = currentTime;
}
setInterval(updateTime, 1000);
updateTime();

var paintWindow = document.querySelector("#paint");
var paintIcon = document.querySelector("#painticon");
var paintClose = document.querySelector("#paintclose");

registerApp("paint", "🎨 Paint");

paintIcon.addEventListener("click", function() {
  openWindow(paintWindow);
  bringToFront(paintWindow);
  showInTaskbar("paint");
});

paintClose.addEventListener("click", function() {
  closeWindow(paintWindow);
  hideFromTaskbar("paint");
});

document.querySelector("#paintminimize").addEventListener("click", function() {
  minimizeWindow("paint");
});

paintWindow.addEventListener("mousedown", function() {
  bringToFront(paintWindow);
});

var canvas = document.querySelector("#paintCanvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var isDrawing = false;
var lastX = 0;
var lastY = 0;
var currentColor = "#000000";
var currentSize = 1;
var currentTool = "pencil";

var PIXEL = 4;

function getMousePos(e) {
  var rect = canvas.getBoundingClientRect();
  var x = Math.floor((e.clientX - rect.left) / PIXEL) * PIXEL;
  var y = Math.floor((e.clientY - rect.top) / PIXEL) * PIXEL;
  return { x: x, y: y };
}

function paintAt(x, y) {
  var size = currentSize * PIXEL;
  if (currentTool === "eraser") {
    ctx.fillStyle = "#ffffff";
  } else {
    ctx.fillStyle = currentColor;
  }
  ctx.fillRect(x, y, size, size);
}

canvas.addEventListener("mousedown", function(e) {
  if (currentTool === "fill") {
    floodFill(getMousePos(e), currentColor);
    return;
  }
  isDrawing = true;
  var pos = getMousePos(e);
  lastX = pos.x;
  lastY = pos.y;
  paintAt(pos.x, pos.y);
});

canvas.addEventListener("mousemove", function(e) {
  if (!isDrawing) return;
  var pos = getMousePos(e);
  paintAt(pos.x, pos.y);
});

canvas.addEventListener("mouseup", function() {
  isDrawing = false;
});

canvas.addEventListener("mouseleave", function() {
  isDrawing = false;
});

function floodFill(pos, hexColor) {
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

document.querySelector("#clearCanvas").addEventListener("click", function() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var tools = {
  toolPencil: "pencil",
  toolEraser: "eraser",
  toolFill: "fill"
};

Object.keys(tools).forEach(function(id) {
  document.querySelector("#" + id).addEventListener("click", function() {
    document.querySelectorAll(".painttool").forEach(function(el) {
      el.classList.remove("selectedtool");
    });
    document.querySelector("#" + id).classList.add("selectedtool");
    currentTool = tools[id];
  });
});

document.querySelectorAll(".sizeoption").forEach(function(el) {
  el.addEventListener("click", function() {
    document.querySelectorAll(".sizeoption").forEach(function(s) {
      s.classList.remove("selectedtool");
    });
    el.classList.add("selectedtool");
    currentSize = parseInt(el.getAttribute("data-size"));
  });
});

var colors = [
  "#000000", "#808080", "#800000", "#ff0000", "#808000", "#ffff00",
  "#008000", "#00ff00", "#008080", "#00ffff", "#000080", "#0000ff",
  "#800080", "#ff00ff", "#ffffff", "#c0c0c0"
];

var palette = document.querySelector("#palette");
colors.forEach(function(color) {
  var swatch = document.createElement("div");
  swatch.className = "swatch";
  swatch.style.backgroundColor = color;
  swatch.addEventListener("click", function() {
    currentColor = color;
  });
  palette.appendChild(swatch);
});

var terminalWindow = document.querySelector("#terminal");
var terminalIcon = document.querySelector("#terminalicon");
var terminalClose = document.querySelector("#terminalclose");
var terminalOutput = document.querySelector("#terminalOutput");
var terminalInput = document.querySelector("#terminalInput");

registerApp("terminal", "💻 Terminal");

terminalIcon.addEventListener("click", function() {
  openWindow(terminalWindow);
  bringToFront(terminalWindow);
  showInTaskbar("terminal");
  terminalInput.focus();
});

terminalClose.addEventListener("click", function() {
  closeWindow(terminalWindow);
  hideFromTaskbar("terminal");
});

document.querySelector("#terminalminimize").addEventListener("click", function() {
  minimizeWindow("terminal");
});

terminalWindow.addEventListener("mousedown", function() {
  bringToFront(terminalWindow);
});

function printLine(text) {
  terminalOutput.innerHTML += text + "\n";
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function typeLine(text, callback) {
  var i = 0;
  var span = document.createElement("span");
  terminalOutput.appendChild(span);
  var interval = setInterval(function() {
    span.innerHTML += text[i];
    i++;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if (i >= text.length) {
      clearInterval(interval);
      terminalOutput.innerHTML += "\n";
      if (callback) callback();
    }
  }, 15);
}

var matrixInterval = null;

function startMatrix() {
  printLine("Starting matrix rain... type 'stop' to exit.");
  var chars = "01";
  matrixInterval = setInterval(function() {
    var line = "";
    for (var i = 0; i < 40; i++) {
      line += chars[Math.floor(Math.random() * chars.length)];
    }
    printLine(line);
  }, 80);
}

function stopMatrix() {
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
    printLine("Matrix stopped.");
  }
}

var commands = {
  help: function() {
    return "Commands: help, about, projects, hack [target], matrix, fortune, ascii, theme [color], whoami, date, echo [text], clear";
  },
  about: function() {
    return "RETRO OS v1.0\nA personal web-based operating system.\nBuilt from scratch with HTML, CSS, and JavaScript.";
  },
  whoami: function() {
    return "ryan@retroOS\nrole: builder, tinkerer, generative-art enjoyer";
  },
  projects: function() {
    return "[1] Pixel Paint App\n[2] This Terminal\n[3] Heart Stud Earrings (Etsy/Depop)\n[4] GLSL Shader Experiments\n[5] Whatever I build next...";
  },
  date: function() {
    return new Date().toString();
  },
  clear: function() {
    terminalOutput.innerHTML = "";
    return null;
  },
  ascii: function() {
    return "  _____  ______ _____ _____   ____    ___   ____  \n" +
           " |  __ \\|  ____|_   _|  __ \\ / __ \\  / _ \\ / ___| \n" +
           " | |__) | |__    | | | |__) | |  | || | | |\\___ \\ \n" +
           " |  _  /|  __|   | | |  _  /| |  | || |_| | ___) |\n" +
           " | | \\ \\| |____ _| |_| | \\ \\| |__| | \\___/ |____/ \n" +
           " |_|  \\_\\______|_____|_|  \\_\\\\____/            ";
  },
  fortune: function() {
    var fortunes = [
      "The bug you're chasing is hiding in the place you already checked twice.",
      "A clean commit message today saves a confused future you tomorrow.",
      "Your next great idea is one weird side project away.",
      "Ship it. You can always fix it in v2.",
      "The terminal remembers everything. The terminal judges nothing."
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  },
  matrix: function() {
    startMatrix();
    return null;
  },
  stop: function() {
    stopMatrix();
    return null;
  },
  theme: function(args) {
    var color = args.trim().toLowerCase();
    var validColors = {
      green: "#33ff33",
      amber: "#ffb000",
      blue: "#33ccff",
      red: "#ff5533",
      white: "#ffffff"
    };
    if (validColors[color]) {
      terminalOutput.style.color = validColors[color];
      terminalInput.style.color = validColors[color];
      document.querySelector("#terminal").querySelector("span").style.color = validColors[color];
      return "Theme set to " + color + ".";
    }
    return "Unknown theme. Try: green, amber, blue, red, white";
  },
  hack: function(args) {
    var target = args.trim() || "the mainframe";
    printLine("Initializing breach sequence on " + target + "...");
    typeLine("[##########] connecting...");
    setTimeout(function() {
      typeLine("[##########] bypassing firewall...");
    }, 600);
    setTimeout(function() {
      typeLine("ACCESS DENIED. (relax, this is just for fun)");
    }, 1400);
    return null;
  }
};

function runCommand(rawInput) {
  var trimmed = rawInput.trim();
  if (trimmed === "") return;

  printLine("> " + trimmed);

  var parts = trimmed.split(" ");
  var commandName = parts[0].toLowerCase();
  var args = parts.slice(1).join(" ");

  if (commandName === "echo") {
    printLine(args);
    return;
  }

  if (commands[commandName]) {
    var result = commands[commandName](args);
    if (result !== null && result !== undefined) {
      printLine(result);
    }
  } else {
    printLine("Command not found: " + commandName + " (type 'help')");
  }
}

terminalInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    runCommand(terminalInput.value);
    terminalInput.value = "";
  }
});

printLine("RETRO OS Terminal v1.0");
printLine("Type 'help' to see available commands, or try 'matrix' or 'hack'.\n");

var weatherWindow = document.querySelector("#weather");
var weatherIcon = document.querySelector("#weathericon");
var weatherClose = document.querySelector("#weatherclose");
var cityInput = document.querySelector("#cityInput");
var citySearchBtn = document.querySelector("#citySearch");
var weatherResult = document.querySelector("#weatherResult");

dragElement(weatherWindow);
registerApp("weather", "⛅ Weather");

weatherIcon.addEventListener("click", function() {
  openWindow(weatherWindow);
  bringToFront(weatherWindow);
  showInTaskbar("weather");
});

weatherClose.addEventListener("click", function() {
  closeWindow(weatherWindow);
  hideFromTaskbar("weather");
});

document.querySelector("#weatherminimize").addEventListener("click", function() {
  minimizeWindow("weather");
});

weatherWindow.addEventListener("mousedown", function() {
  bringToFront(weatherWindow);
});

var weatherCodeMap = {
  0: "☀️ Clear sky",
  1: "🌤️ Mainly clear",
  2: "⛅ Partly cloudy",
  3: "☁️ Overcast",
  45: "🌫️ Foggy",
  48: "🌫️ Freezing fog",
  51: "🌦️ Light drizzle",
  53: "🌦️ Drizzle",
  55: "🌧️ Heavy drizzle",
  61: "🌧️ Light rain",
  63: "🌧️ Rain",
  65: "🌧️ Heavy rain",
  71: "🌨️ Light snow",
  73: "🌨️ Snow",
  75: "❄️ Heavy snow",
  80: "🌦️ Rain showers",
  81: "🌧️ Rain showers",
  82: "⛈️ Violent showers",
  95: "⛈️ Thunderstorm",
  96: "⛈️ Thunderstorm with hail",
  99: "⛈️ Severe thunderstorm"
};

function getWeatherDescription(code) {
  return weatherCodeMap[code] || "🌡️ Unknown conditions";
}

async function fetchWeather(city) {
  weatherResult.innerHTML = "<p>Loading...</p>";

  try {
    var geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1");
    var geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherResult.innerHTML = "<p>City not found. Try another spelling.</p>";
      return;
    }

    var place = geoData.results[0];
    var lat = place.latitude;
    var lon = place.longitude;
    var displayName = place.name + (place.admin1 ? ", " + place.admin1 : "") + (place.country ? ", " + place.country : "");

    var weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=fahrenheit&wind_speed_unit=mph");
    var weatherData = await weatherRes.json();

    var current = weatherData.current;
    var description = getWeatherDescription(current.weather_code);

    weatherResult.innerHTML =
      "<p style='font-weight: bold; margin: 0 0 4px 0;'>" + displayName + "</p>" +
      "<p style='font-size: 28px; margin: 4px 0;'>" + description.split(" ")[0] + "</p>" +
      "<p style='font-size: 20px; margin: 4px 0;'>" + Math.round(current.temperature_2m) + "°F</p>" +
      "<p style='margin: 4px 0; font-size: 12px;'>" + description.substring(description.indexOf(" ") + 1) + "</p>" +
      "<p style='margin: 4px 0; font-size: 11px; color: #444444;'>Wind: " + Math.round(current.wind_speed_10m) + " mph &nbsp;|&nbsp; Humidity: " + current.relative_humidity_2m + "%</p>";

  } catch (error) {
    weatherResult.innerHTML = "<p>Couldn't fetch weather. Check your connection.</p>";
  }
}

citySearchBtn.addEventListener("click", function() {
  var city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

cityInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    var city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  }
});