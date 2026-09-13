import { currentPdf, currentPage, totalPages, setCurrentPage } from './app.js';
import { renderLibrary } from './library.js';

const pageCounter = document.getElementById("page-counter");
const backBtn = document.getElementById("back-to-library-btn");
const bookTextContent = document.getElementById("book-text-content");
const prevBtn = document.getElementById("prev-page-btn");
const nextBtn = document.getElementById("next-page-btn");
const dictModal = document.getElementById("dict-modal");
const modalWord = document.getElementById("modal-word");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalTranslation = document.getElementById("modal-translation");
const modalDefinition = document.getElementById("modal-definition");
const playAudioBtn = document.getElementById("play-audio-btn");
const addToVocabBtn = document.getElementById("add-to-vocab-btn");
const libraryScreen = document.getElementById("library-screen");
const readerScreen = document.getElementById("reader-screen");
const bookTitle = document.getElementById("reader-book-title");



export function renderPage(pageNumber) {
  currentPdf.getPage(pageNumber).then((page) => {
    page.getTextContent().then((textContent) => {
      const text = textContent.items.map((item) => item.str).join(" ");
      processText(text);
    });
  });

  pageCounter.textContent = `Страница: ${pageNumber} / ${totalPages}`;
}

export function updateBookProgress() {
  const books = JSON.parse(localStorage.getItem("books")) || [];

  const currentBook = books.find(
    (book) => book.title === bookTitle.textContent,
  );

  if (currentBook) {
    currentBook.currentPage = currentPage;
    localStorage.setItem("books", JSON.stringify(books));
  }
}


function processText(rawText) {
  const words = rawText.split(" ");
  bookTextContent.innerHTML = "";

  words.forEach((word) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");
    bookTextContent.appendChild(span);
    bookTextContent.appendChild(document.createTextNode(" "));
  });
}


function getTranslation(word) {
  modalTranslation.textContent = "Searching...";
  modalDefinition.textContent = "Definition...";

  fetch(`http://localhost:3000/api/translate?word=${encodeURIComponent(word)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        modalTranslation.textContent = "Translation error";
        return;
      }

      modalTranslation.textContent = data.translation || "Не найдено";
      modalDefinition.textContent =
        data.definition || "Определение отсутствует";
    })
    .catch((error) => {
      console.error("Ошибка получения данных:", error);
      modalTranslation.textContent = "Translation error";
      modalDefinition.textContent = "Definition error";
    });
}


backBtn.addEventListener("click", () => {
  readerScreen.classList.add("hidden");
  libraryScreen.classList.remove("hidden");
  renderLibrary();
});


nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage+1);
    renderPage(currentPage);
    updateBookProgress();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage-1);
    renderPage(currentPage);
    updateBookProgress();
  }
});

bookTextContent.addEventListener("click", (e) => {
  const target = e.target;
  const clickedWord = target.textContent
    .replace(/[.,\/#!\$%\^&\*;:{}=\-_~()?"']/g, "")
    .toLowerCase();

  if (target.classList.contains("word")) {
    addToVocabBtn.textContent = "⭐Добавить в словарь";
    addToVocabBtn.classList.remove("active");

    dictModal.classList.remove("hidden");
    modalWord.textContent = clickedWord;

    modalTranslation.textContent = "Searching...";
    modalDefinition.textContent = "Definition...";

    getTranslation(clickedWord);
  }
});

closeModalBtn.addEventListener("click", () => {
  dictModal.classList.add("hidden");
});

playAudioBtn.addEventListener("click", () => {
  const wordToSpeak = modalWord.textContent;

  if (!wordToSpeak) return;

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    window.speechSynthesis.speak(utterance);
  } else {
    alert("Ваш браузер не поддерживает озвучивание речи.");
  }
});

addToVocabBtn.addEventListener("click", () => {
  const newWord = {
    word: modalWord.textContent,
    translation: modalTranslation.textContent,
  };

  const vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [];

  if (vocabulary.some((item) => item.word === newWord.word)) {
    addToVocabBtn.textContent = "📓 Слово уже в словаре!";
    console.log("Yze est");
  }

  if (!vocabulary.some((item) => item.word === newWord.word)) {
    vocabulary.push(newWord);
    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
    addToVocabBtn.textContent = "✓ Добавлено!";
    addToVocabBtn.classList.toggle("active");
    console.log("Zapisano");
  }
});

document.addEventListener("click", (e) => {
  if (
    !dictModal.contains(e.target) &&
    !e.target.classList.contains("word") &&
    !dictModal.classList.contains("hidden")
  ) {
    dictModal.classList.add("hidden");
  }
});
