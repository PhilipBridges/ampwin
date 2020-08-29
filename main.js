const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const Store = require("./Store");
const path = require("path");
const MainWindow = require("./MainWindow");
const AppTray = require("./AppTray");
const { ipcRenderer } = require("electron");
const { dialog } = require("electron");
const log = require("electron-log");

// Set env
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let tray;

const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      volume: 90,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow("./app/index.html", isDev);
}

app.on("ready", () => {
  createMainWindow();
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return true;
  });

  const icon = path.join(__dirname, "./assets", "icons", "tray_icon.png");

  tray = new AppTray(icon, mainWindow);

  mainWindow.on("ready", () => (mainWindow = null));
});

ipcMain.on("settings:set", (e, value) => {
  store.set("settings", value);

  mainWindow.webContents.send("settings:get", store.get("settings"));
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv, cwd) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      log.info("ARGV " + argv);

      mainWindow.webContents.send("open:song", argv[3]);
    }
  });
}

ipcMain.on("get-file-data", (event) => {
  var data = null;
  if (process.platform == "win32" && process.argv.length >= 2) {
    var openFilePath = process.argv[1];
    data = openFilePath;
  }
  event.returnValue = data;
});

//

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Navigation",
        click: () => mainWindow.webContents.send("nav:toggle"),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.allowRendererProcessReuse = true;
