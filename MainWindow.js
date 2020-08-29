const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: "ampwin",
      width: isDev ? 800 : 355,
      height: 600,
      // icon: `${__dirname}/assets/icons/icon.png`,
      resizable: isDev ? true : false,
      show: false,
      opacity: 0.95,
      webPreferences: {
        nodeIntegration: true,
      },
      
    });

    this.loadFile(file);

    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
