var app = require('app')
var BrowserWindow = require('browser-window')
var ipc = require("electron").ipcMain
app.on('ready', function(){
  var mainwindow = new BrowserWindow({
    minWidth: 800,
    width: 1920,
    height: 1080
  })

  mainwindow.setMenu(null)
  mainwindow.loadURL('file://' + __dirname + '/index.html')
  mainwindow.openDevTools()

  var aboutWindow = new BrowserWindow({
    width:  200,
    height: 400,
    show: false
  })
  aboutWindow.loadURL('file://' + __dirname + 'about.html')

  ipc.on('show-about', function(){
    aboutWindow.show()
  })
})
