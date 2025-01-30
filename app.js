const express = require('express')
const shadowsObj = require('./utilsShadows.js')
const webSockets = require('./utilsWebSockets.js')

/*
    WebSockets server, example of messages:

    From client to server:
        - Mouse over cell       { "type": "cellOver", "value", 0 }
        - Choosen cell          { "type": "cellChoice", "value", 0 }

    From server to client:
        - socketId              { "type": "socketId", "value": "001" }
        - initMatch             { "type": "initMatch", "value": match }
        - gameRound             { "type": "gameRound", "value": match }
        - opponentOver          { "type": "opponentOver", value: 0 }
        - gameOver              { "type": "gameOver", "winner": "X", "value": match }

    match objects are like: 
        { 
            playerX: "001", 
            playerO: "002", 
            board: ["X", "", "", "", "", "", "", "", ""],
            nextTurn: "O"
        }
    cell values are like:
        0 1 2
        3 4 5
        6 7 8
    winner values are like:
        "X" or "O" or "" (in case of tie)
 */

var ws = new webSockets()
let shadows = new shadowsObj()

// Jugadors i partides
let matches = []

// Start HTTP server
const app = express()
const port = process.env.PORT || 8080

// Publish static files from 'public' folder
app.use(express.static('public'))

// Activate HTTP server
const httpServer = app.listen(port, appListen)

async function appListen() {
    await shadows.init('./public/index.html', './public/shadows')
    console.log(`Listening for HTTP queries on: http://localhost:${port}`)
    console.log(`Development queries on: http://localhost:${port}/index-dev.html`)
}

// Close connections when process is killed
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    httpServer.close()
    ws.end()
    process.exit(0);
}

// WebSockets
ws.init(httpServer, port)

function randomBoard() {
    const cardArray = [];
    // Afegir les parelles de cartes
    for (let i = 0; i < 8; i++) {
        cardArray.push(i + "H");
        cardArray.push(i + "H");
    }
    // Fer shuffle de les cartes
    cardArray.sort((a, b) => 0.5 - Math.random());
    return cardArray;
}

ws.onConnection = (socket, id) => {

    console.log("WebSocket client connected: " + id)
    idMatch = -1
    playersReady = false

    if (matches.length == 0) {
        // Si no hi ha partides, en creem una de nova
        idMatch = 0
        matches.push({
            playerX: id,
            playerNameX: "User X",
            playerO: "",
            playerNameO: "User O",
            playerXPoints: 0,
            playerOPoints: 0,
            board: randomBoard(),
            selectedCard: "",
            nextTurn: "X"
        })
    } else {
        // Si hi ha partides, mirem si n'hi ha alguna en espera de jugador
        for (let i = 0; i < matches.length; i++) {
            if (matches[i].playerX == "") {
                idMatch = i
                matches[i].playerX = id
                playersReady = true
                break
            } else if (matches[i].playerO == "") {
                idMatch = i
                matches[i].playerO = id
                playersReady = true
                break
            }
        }
        // Si hi ha partides, però totes ocupades creem una de nova
        if (idMatch == -1) {
            idMatch = matches.length
            matches.push({
                playerX: id,
                playerNameX: "User X",
                playerO: "",
                playerNameO: "User O",
                playerXPoints: 0,
                playerOPoints: 0,
                board: randomBoard(),
                selectedCard: "",
                nextTurn: "X"
            })
        }
    }

    // Enviem l'identificador de client socket
    socket.send(JSON.stringify({
        type: "socketId",
        value: id
    }))

    // Enviem l'estat inicial de la partida
    socket.send(JSON.stringify({
        type: "initMatch",
        value: matches[idMatch]
    }))

    // Si ja hi ha dos jugadors
    if (playersReady) {
        let idOpponent = ""
        if (matches[idMatch].playerX == id) {
            idOpponent = matches[idMatch].playerO
        } else {
            idOpponent = matches[idMatch].playerX
        }

        let wsOpponent = ws.getClientById(idOpponent)
        if (wsOpponent != null) {
            // Informem al oponent que ja té rival
            wsOpponent.send(JSON.stringify({
                type: "initMatch",
                value: matches[idMatch]
            }))

            // Informem al oponent que toca jugar
            wsOpponent.send(JSON.stringify({
                type: "gameRound",
                value: matches[idMatch]
            }))

            // Informem al player que toca jugar
            socket.send(JSON.stringify({
                type: "gameRound",
                value: matches[idMatch]
            }))
        }
    }
}

function sendToAllPlayers(idMatch, payload) {
    const payloadString = JSON.stringify(payload);
    ws.getClientById(matches[idMatch].playerX)?.send(payloadString)
    ws.getClientById(matches[idMatch].playerO)?.send(payloadString)
}

function sendGameRound(idMatch) {
    sendToAllPlayers(idMatch, {
        type: "gameRound",
        value: matches[idMatch]
    })
}

ws.onMessage = (socket, id, msg) => {
    let obj = JSON.parse(msg)
    let idMatch = -1
    let playerTurn = ""
    let idSend = ""
    let wsSend = null

    // Busquem la partida a la que pertany el client
    for (let i = 0; i < matches.length; i++) {
        if (matches[i].playerX == id || matches[i].playerO == id) {
            idMatch = i
            break
        }
    }

    // Processar el missatge rebut
    if (idMatch != -1) {
        switch (obj.type) {
            case "setUsername":
                if (id === matches[idMatch].playerX) {
                    matches[idMatch].playerNameX = obj.value;
                } else {
                    matches[idMatch].playerNameO = obj.value;
                }
                sendToAllPlayers(idMatch, {
                    type: "initMatch",
                    value: matches[idMatch]
                })
                break;
            case "cellOver":
                // Si revem la posició del mouse de qui està jugant, l'enviem al rival
                playerTurn = matches[idMatch].nextTurn
                idSend = matches[idMatch].playerX
                if (playerTurn == "X") idSend = matches[idMatch].playerO

                wsSend = ws.getClientById(idSend)
                if (wsSend != null) {
                    wsSend.send(JSON.stringify({
                        type: "opponentOver",
                        value: obj.value
                    }))
                }
                break
            case "cellChoice":
                matches[idMatch].lastMatchGuess = null;
                if (matches[idMatch].selectedCard === "") {
                    matches[idMatch].selectedCard = obj.value
                } else {
                    const card1 = matches[idMatch].board [matches[idMatch].selectedCard]
                    const card2 = matches[idMatch].board [obj.value]
                    if (card1[0] === card2[0]) {
                        matches[idMatch].board[matches[idMatch].selectedCard] = card1[0] + "V" + matches[idMatch].nextTurn
                        matches[idMatch].board [obj.value] = card2[0] + "V" + matches[idMatch].nextTurn

                        if (matches[idMatch].nextTurn === "X")
                            matches[idMatch].playerXPoints += 1;
                        else
                            matches[idMatch].playerOPoints += 1;
                    }

                    matches[idMatch].lastMatchGuess = [matches[idMatch].selectedCard, obj.value]
                    matches[idMatch].selectedCard = "";
                    matches[idMatch].nextTurn = matches[idMatch].nextTurn === "X" ? "O" : "X";
                }

                // Comptar quantes cartes amagades queden
                let hiddenCounter = 0;
                for (let i = 0; i < matches[idMatch].board.length; i++) {
                    if (matches[idMatch].board[i][1] === "H")
                        hiddenCounter += 1;
                }

                if (hiddenCounter === 0) {
                    let winner = null;
                    if (matches[idMatch].playerXPoints > matches[idMatch].playerOPoints) {
                        winner = "X"
                    } else if (matches[idMatch].playerXPoints < matches[idMatch].playerOPoints) {
                        winner = "O"
                    } else {
                        winner = null;
                    }
                    sendToAllPlayers(idMatch, {
                        type: "gameOver",
                        value: matches[idMatch],
                        winner: winner,
                    })
                    return;
                }

                sendGameRound(idMatch);


                break
        }
    }
}

ws.onClose = (socket, id) => {
    console.log("WebSocket client disconnected: " + id)

    // Busquem la partida a la que pertany el client
    idMatch = -1
    for (let i = 0; i < matches.length; i++) {
        if (matches[i].playerX == id || matches[i].playerO == id) {
            idMatch = i
            break
        }
    }
    // Informem al rival que s'ha desconnectat
    if (idMatch != -1) {

        if (matches[idMatch].playerX == "" && matches[idMatch].playerO == "") {
            // Esborrar la partida per falta de jugadors
            matches.splice(idMatch, 1)
        } else {

            // Reiniciem el taulell
            matches[idMatch].board = randomBoard();
            matches[idMatch].playerXPoints = 0;
            matches[idMatch].playerNameX = "User X";
            matches[idMatch].playerOPoints = 0;
            matches[idMatch].playerNameO = "User O";
            matches[idMatch].selectedCard = "";
            matches[idMatch].lastMatchGuess = null;
            matches[idMatch].nextTurn = "X";

            // Esborrar el jugador de la partida
            let rival = ""
            if (matches[idMatch].playerX == id) {
                matches[idMatch].playerX = ""
                rival = matches[idMatch].playerO
            } else {
                matches[idMatch].playerO = ""
                rival = matches[idMatch].playerX
            }

            // Informar al rival que s'ha desconnectat
            let rivalSocket = ws.getClientById(rival)
            if (rivalSocket != null) {
                rivalSocket.send(JSON.stringify({
                    type: "opponentDisconnected"
                }))
            }
        }
    }
}

// Configurar la direcció '/index-dev.html' per retornar
// la pàgina que descarrega tots els shadows (desenvolupament)
app.get('/index-dev.html', getIndexDev)

async function getIndexDev(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(shadows.getIndexDev())
}

// Configurar la direcció '/shadows.js' per retornar
// tot el codi de les shadows en un sol arxiu
app.get('/shadows.js', getShadows)

async function getShadows(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(shadows.getShadows())
}