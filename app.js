const express = require('express')
const shadowsObj = require('./utilsShadows.js')
const webSockets = require('./utilsWebSockets.js')
const port = 3000

// Publicar arxius carpeta ‘public’ 
app.use(express.static('public'))



