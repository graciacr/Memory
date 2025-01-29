// document.addEventListener("DOMContentLoaded", function() {
//   let btn = document.getElementById("btn");
//   btn.addEventListener("click", userInfo);
// });

function loginOnClick() {
  if(userInfo()){
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

  String.prototype.isAlpha = function() {
      return /^[a-zA-Z]+$/.test(this);
  };
  

  if (serverInput.value.trim().toLowerCase() !== "localhost") {
      Swal.fire({
          title: "Oops...",
          heightAuto: false,
          text: 'Por favor, asegúrate de que el servidor sea localhost. Este sistema está diseñado para ejecutarse exclusivamente en un entorno local.',
          icon: 'error',
          button: '',
          customClass: {
              container: 'swal-custom-container'
          }
      });
      return false;
  } else if (portInput.value.trim() !== "8080") {
      Swal.fire({
          title: "Oops...",
          heightAuto: false,
          text: 'Parece que has ingresado un puerto no válido. Por favor, asegúrate de usar el puerto 8888 para acceder correctamente.',
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
      return true;
  }
  // <!-- comentario para subirlo -->
}   


const board = document.getElementById('board');
const status = document.getElementById('status');
const loginElement = document.getElementById('loginElement');
let gameId = null;
let player = null;
let ws = null;

const cards = [
  'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 
  'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'
];

let flippedCards = [];
let matchedCards = [];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function renderBoard() {
  const shuffledCards = shuffle([...cards]);
  board.innerHTML = '';

  shuffledCards.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.value = card;
    cardElement.dataset.index = index;
    board.appendChild(cardElement);

    cardElement.addEventListener('click', () => handleCardClick(cardElement));
  });
}

function handleCardClick(card) {
  if (flippedCards.length === 2 || matchedCards.includes(card.dataset.index)) {
    return;
  }

  card.classList.add('flipped');
  card.textContent = card.dataset.value;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [firstCard, secondCard] = flippedCards;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchedCards.push(firstCard.dataset.index, secondCard.dataset.index);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    flippedCards = [];

    ws.send(JSON.stringify({ type: 'move', gameId, move: { type: 'match', cards: [firstCard.dataset.index, secondCard.dataset.index] } }));
  } else {
    firstCard.classList.add('error');
    secondCard.classList.add('error');

    setTimeout(() => {
      firstCard.classList.remove('flipped', 'error');
      secondCard.classList.remove('flipped', 'error');
      firstCard.textContent = '';
      secondCard.textContent = '';
      flippedCards = [];

      ws.send(JSON.stringify({ type: 'move', gameId, move: { type: 'mismatch', cards: [firstCard.dataset.index, secondCard.dataset.index] } }));
    }, 1000);
  }
}


function initWebsocket(){
  const server = document.getElementById("server").value;
  const port = document.getElementById("port").value;
  ws = new WebSocket(`ws://${server}:${port}`);
  player = document.getElementById("name").value;

  ws.onopen = () => {
    status.textContent = 'Conectado al servidor';
    ws.send(JSON.stringify({ type: 'join', gameId, player }));
    loginElement.innerHTML = "";
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
  
    if (message.type === 'move') {
      const { move } = message;
  
      if (move.type === 'match') {
        move.cards.forEach(index => {
          const card = document.querySelector(`.card[data-index="${index}"]`);
          card.classList.add('matched');
          card.textContent = card.dataset.value;
        });
      } else if (move.type === 'mismatch') {
        move.cards.forEach(index => {
          const card = document.querySelector(`.card[data-index="${index}"]`);
          card.classList.add('error');
  
          setTimeout(() => {
            card.classList.remove('flipped', 'error');
            card.textContent = '';
          }, 1000);
        });
      }
    }
  };

  // renderBoard();
}