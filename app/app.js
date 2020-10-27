const express = require('express')
const daemon = express()
const port = 8866
const fs = require('fs')
const { app, Menu, Tray } = require('electron')

let tray = null;
app.on('ready', () => {
    let path = app.getAppPath()
    
    daemon.use(express.static(path + '/dist'))
    
    daemon.get('/', (req, res) => {
        let index = fs.readFileSync( path + '/dist/index.html' )
        res.end(index)
    })
    
    daemon.listen(port, () => console.log(`IdaNode Watchtower listening at http://localhost:${port}`))

    tray = new Tray( path + '/dist/logo.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open watchtower', click: () => { require("electron").shell.openExternal("http://localhost:" + port) } },
        { label: 'Quit', click: () => { app.quit() } },
    ]);
    tray.setToolTip('IdaNode Watchtower.')
    tray.setContextMenu(contextMenu)
})