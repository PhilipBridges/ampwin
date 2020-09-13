const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: "ampwin",
      width: isDev ? 800 : 565,
      height: 390,
      // icon: `${__dirname}/assets/icons/icon.png`,
      resizable: true,
      show: true,
      opacity: 0.95,
      webPreferences: {
        nodeIntegration: true,
      },
      frame: false,
    });

    this.loadFile(file);

    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
