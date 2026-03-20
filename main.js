const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Strategos Chess",
    icon: path.join(__dirname, "public", "logo.png"),
    backgroundColor: "#0a0b14",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "default",
    autoHideMenuBar: true,
  });

  if (isDev) {
    // In development, connect to Next.js dev server
    mainWindow.loadURL("http://localhost:3000");
    // Open DevTools in dev
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built Next.js app
    mainWindow.loadFile(path.join(__dirname, "out", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
