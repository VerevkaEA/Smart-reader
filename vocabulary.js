const vocabScreen = document.getElementById("vocab-screen");
const gameScreen = document.getElementById("game-screen");
const startGameBtn = document.getElementById("start-game-btn");
const backToVocabBtn = document.getElementById("back-to-vocab-btn");
const readerScreen = document.getElementById("reader-screen");
const libraryScreen = document.getElementById("library-screen");
const restartGameBtn = document.getElementById("restart-game-btn")

let isBoard=false
let firstSelectedCard = null;

export function renderVocabulary() {
  console.log("Screen vocab");

  const vocabList = document.getElementById("vocab-list");
  const vocabCount = document.getElementById("vocab-count");

  vocabList.innerHTML = "";

  const vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [];

  vocabCount.textContent = vocabulary.length;

  vocabulary.forEach((item) => {
    const wordCard = `
        <div class="word-card">
        <button class="delete-word-btn">✕</button>
        <h4>${item.word}</h4>
        <p>${item.translation}</p>
        </div>`;

    vocabList.insertAdjacentHTML("beforeend", wordCard);

    const card = vocabList.lastElementChild;
    const deleteBtn = card.querySelector(".delete-word-btn");

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const updatedVocabulary = vocabulary.filter((v) => v.word !== item.word);
      localStorage.setItem("vocabulary", JSON.stringify(updatedVocabulary));
      renderVocabulary();
    });
  });
}

function startGame() {
  const vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [];

  if (vocabulary.length < 3) {
    alert("Добавьте хотя бы 3 слова в словарь, чтобы начать игру!");
    gameScreen.classList.add("hidden");
    vocabScreen.classList.remove("hidden");
    readerScreen.classList.add("hidden");
    libraryScreen.classList.add("hidden");
    return;
  }

  const gameGrid = document.getElementById("game-grid");

  gameGrid.innerHTML = "";

  const winMessage=document.getElementById("win-message")

  winMessage.classList.add("hidden");

  let cards = [];
  vocabulary.forEach((item) => {
    cards.push({ text: item.word, id: item.word, type: "eng" });
    cards.push({ text: item.translation, id: item.word, type: "rus" });
  });

  cards.sort(() => Math.random() - 0.5);

  cards.forEach((cardData) => {
    const gameCard = `
    <div class="game-card" data-id="${cardData.id}" data-type="${cardData.type}">
  ${cardData.text}
</div>`;
    gameGrid.insertAdjacentHTML("beforeend", gameCard);

    const cardElement = gameGrid.lastElementChild;
    cardElement.addEventListener("click", () => {
if(isBoard) return;

      if (
        cardElement.classList.contains("selected") ||
        cardElement.classList.contains("matched") ||
        cardElement.classList.contains("correct")
      ) {
        return;
      }
      if (!firstSelectedCard) {
        firstSelectedCard = cardElement;
        cardElement.classList.add("selected");
      } else {
        const id1 = firstSelectedCard.dataset.id;
        const id2 = cardElement.dataset.id;
        const type1 = firstSelectedCard.dataset.type;
        const type2 = cardElement.dataset.type;

        if (id1 === id2 && type1 !== type2) {
          firstSelectedCard.classList.remove("selected");
          firstSelectedCard.classList.add("correct");
          cardElement.classList.add("correct");

          const card1 = firstSelectedCard;
          const card2 = cardElement;

          setTimeout(() => {
            card1.classList.remove("correct");
            card2.classList.remove("correct");
            card1.classList.add("matched");
            card2.classList.add("matched");
            checkWin()
          }, 500);

          firstSelectedCard = null;
        } else {
          const card1 = firstSelectedCard;
          const card2 = cardElement;

          isBoard = true;

          firstSelectedCard.classList.remove("selected");
          firstSelectedCard.classList.add("wrong");
          cardElement.classList.add("wrong");

          setTimeout(() => {
            card1.classList.remove("wrong");
            card2.classList.remove("wrong");
            isBoard = false;
          }, 800);

          firstSelectedCard = null;
        }
      }
    });
  });
}

function checkWin(){
  const winMessage=document.getElementById("win-message")

  if(document.querySelectorAll(".game-card:not(.matched)").length===0){
    winMessage.classList.remove("hidden")
  }
}

startGameBtn.addEventListener("click", () => {
  vocabScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  readerScreen.classList.add("hidden");
  libraryScreen.classList.add("hidden");

  startGame();
});

backToVocabBtn.addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  vocabScreen.classList.remove("hidden");
  readerScreen.classList.add("hidden");
  libraryScreen.classList.add("hidden");
});

restartGameBtn.addEventListener("click",()=>{
  startGame()
})