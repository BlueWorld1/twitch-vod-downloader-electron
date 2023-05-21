const { app, BrowserWindow, ipcMain } = require("electron");
const packageJson = require(`${__dirname}/../../package.json`);
const path = require("path");
const { spawnSync } = require("child_process");
let win;

function saveVodToDisk(source, metadata, format) {
  const filePath = `${metadata.owner.replaceAll(
    " ",
    "_"
  )}_${metadata.title.replaceAll(" ", "_")}.${format}`;
  const command = `${__dirname}/../../bin/youtube-dl --recode-video ${format} -o .\\VOD\\${filePath} ${source.url}`;

  const result = spawnSync(command, { stdio: "inherit", shell: true });

  if (result.error) {
    throw result.error;
  }
  return true;
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(`file://${__dirname}/../../dist/${packageJson.name}/index.html`);

  win.on("closed", () => {
    win = null;
  });
  ipcMain.on(
    "vod:download",
    (_, { selectedSource, selectedFormat, vodInfos }) => {
      win.webContents.send("vod:download:started");
      const result = saveVodToDisk(selectedSource, vodInfos, selectedFormat);
      win.webContents.send("vod:download:finished", result);
    }
  );
}

app.on("ready", createWindow);

app.on("window.ts-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
