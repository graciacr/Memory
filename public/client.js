// document.addEventListener("DOMContentLoaded", function() {
//   let btn = document.getElementById("btn");
//   btn.addEventListener("click", userInfo);
// });

const board = document.getElementById('board');
const status = document.getElementById('status');
const loginElement = document.getElementById('loginElement');
let player = null;
let ws = null;

function loginOnClick() {
    if (userInfo()) {
        loginElement.style.display = "none"
        status.textContent = 'Conectando al servidor...';
        initWebsocket();
    }
}

function userInfo() {
    // Coger elementos del server
    let serverInput = document.getElementById("server");
    // let parent = serverInput.closest(".entryarea");
    // let labelText = serverParent.querySelector(".labelline")?.textContent.trim();
    // Coger elementos del puerto
    let portInput = document.getElementById("port");
    //Coger elementos del nombre
    let nameInput = document.getElementById("name");

    String.prototype.isAlpha = function () {
        return /^[a-zA-Z]+$/.test(this);
    };


    if (!/^[a-zA-Z.0-9]+$/.test (serverInput.value.trim().toLowerCase())) {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Por favor, asegúrate de que el servidor sea una IP o un nombre de host correcto.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
        return false;
    } else if (!/^\d+$/.test (portInput.value.trim())) {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Parece que has ingresado un puerto no válido. Por favor, asegúrate de usar un puerto numérico.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
        return false;
    } else if (!/^[a-zA-Z]+$/.test(nameInput.value.trim())) {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Parece que has ingresado un nombre no válido. Por favor, asegúrate de que el nombre contenga solo letras.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
        return false;
    } else {
        return true;
    }
    // <!-- comentario para subirlo -->
}

function connectionError() {
    Swal.fire({
        title: "Connexió perduda",
        heightAuto: false,
        text: 'S\'ha perdut la connexió amb el servidor o amb el contrincant',
        icon: 'error',
        button: '',
        customClass: {
            container: 'swal-custom-container'
        }
    }).then(result => {
        window.location.reload();
    })
}





function initWebsocket() {
    const server = document.getElementById("server").value;
    const port = document.getElementById("port").value;
    ws = new WebSocket(`ws://${server}:${port}`);
    player = document.getElementById("name").value;
    let clientId = null;
    let ownPlayerSymbol = null;

    ws.onopen = () => {
        status.textContent = 'Conectado al servidor. Esperando jugadores...';
        ws.send(JSON.stringify({type: 'setUsername', value: player}));
        Swal.fire({
            title: "Correcto",
            heightAuto: false,
            text: 'Has puesto todos los datos correctamente, ahora se te llevará a la siguiente página donde deberás esperar hasta conectar para jugar contra otro usuario.',
            icon: 'success',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });

    };

    function updateOwnPlayerSymbol(gameRoundValue) {
        if (gameRoundValue.playerX === clientId) {
            ownPlayerSymbol = "X";
        } else if (gameRoundValue.playerO === clientId) {
            ownPlayerSymbol = "O";
        } else {
            console.warn("Player symbol not found");
        }
    }

    function handleCardClick(cardElement) {
        ws.send(JSON.stringify({
            type: "cellChoice",
            value: parseInt(cardElement.dataset.index)
        }))

    }

    function renderBoard(gameRoundValue) {
        board.innerHTML = '';

        gameRoundValue.board.forEach((card, index) => {
            const cardElement = document.createElement('button');
            cardElement.classList.add('card');
            cardElement.classList.add(`card${parseInt(card[0])+1}`);

            if(card[2] === "X"){
                cardElement.classList.add('card-highlightX');
            }
            if(card[2] === "O"){
                cardElement.classList.add('card-highlightO');
            }

            // cardElement.innerHTML = card[0];
            if (gameRoundValue.selectedCard === index)
                cardElement.classList.add('card-highlight');
                // cardElement.innerHTML += "*";
            if (card[1] === "H" && !(gameRoundValue.selectedCard === index))
                cardElement.classList.add('hidden');
            cardElement.dataset.value = card;
            cardElement.dataset.index = index;
            cardElement.disabled = gameRoundValue.nextTurn !== ownPlayerSymbol || gameRoundValue.selectedCard === index || card[1] === "V";

            if (gameRoundValue.lastMatchGuess != null && gameRoundValue.lastMatchGuess.includes(index)){
                cardElement.dataset.forceShow = true;
                setTimeout(() => {
                    cardElement.dataset.forceShow = false;
                }, 2000)
            }

            board.appendChild(cardElement);

            cardElement.addEventListener('click', () => handleCardClick(cardElement));
        });
    }

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message)
        function getUserStatus() {
            return `<p class="playerXColor">${message.value.nextTurn === "X" ? "Turno de " : "En espera "}${message.value.playerNameX}: ${message.value.playerXPoints}</p><p class="playerOColor">${message.value.nextTurn === "O" ? "Turno de " : "En espera "}${message.value.playerNameO}: ${message.value.playerOPoints}</p>`
        }

        switch (message.type) {
            case 'initMatch':
                if (message.value.playerX != "" && message.value.playerO != ""){
                    status.innerHTML = getUserStatus();
                }
                break;
            case  'socketId':
                clientId = message.value;
                break;
            case 'gameRound':
                document.getElementById("btnLogout").style.visibility = 'visible';
                status.innerHTML = getUserStatus();
                updateOwnPlayerSymbol(message.value);
                renderBoard(message.value);
                break;
            case 'gameOver':
                let messageText = null;
                if (message.winner == null) {
                    messageText = "El resultado ha sido un empate!";
                } else if (message.winner === "X") {
                    messageText = "Ha ganado " + message.value.playerNameX + "!";
                } else {
                    messageText = "Ha ganado " + message.value.playerNameO + "!";
                }
                Swal.fire({
                    title: "Partida acabada",
                    heightAuto: false,
                    text: messageText,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: "Volver a jugar",
                    cancelButtonText: "Salir",
                    customClass: {
                        container: 'swal-custom-container'
                    },
                }).then((result) => {
                    if (result.isConfirmed){
                        initWebsocket()
                    }
                    else
                        window.location.reload()
                });

                break;
            case "opponentDisconnected":
                connectionError()
                break;
        }

        // if (message.type === 'move') {
        //   const { move } = message;
        //
        //   if (move.type === 'match') {
        //     move.cards.forEach(index => {
        //       const card = document.querySelector(`.card[data-index="${index}"]`);
        //       card.classList.add('matched');
        //       card.textContent = card.dataset.value;
        //     });
        //   } else if (move.type === 'mismatch') {
        //     move.cards.forEach(index => {
        //       const card = document.querySelector(`.card[data-index="${index}"]`);
        //       card.classList.add('error');
        //
        //       setTimeout(() => {
        //         card.classList.remove('flipped', 'error');
        //         card.textContent = '';
        //       }, 1000);
        //     });
        //   }
        // }
    };

    ws.onclose = () => {
        connectionError();
    }
}