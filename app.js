const express = require('express')
// const shadowsObj = require('./utilsShadows.js')
// const webSockets = require('./utilsWebSockets.js')
const port = 8080

const app = express()
app.listen(port)
// Publicar arxius carpeta ‘public’ 
app.use(express.static('public'))



