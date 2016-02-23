var app = require('app')
var BrowserWindow = require('browser-window')
var ipc = require("electron").ipcMain
app.on('ready', function(){
  var mainwindow = new BrowserWindow({
    width: 1000,
    height: 600
  })
  mainwindow.loadURL('file://' + __dirname + '/main.html')
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
