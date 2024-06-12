const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged; // Check if in development mode

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startURL = isDev
    ? "http://localhost:19006"
    : `file://${path.join(__dirname, "../web-build/index.html")}`;

  win.loadURL(startURL);
  win.webContents.openDevTools(); // Open dev tools in development
}

ipcMain.on("save-json", async (event, jsonString) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: "song_data.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, jsonString);
  }
});

app.whenReady().then(createWindow);
