import { renderLibrary } from "./library.js";
import { renderVocabulary } from "./vocabulary.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

const gameBtn = document.getElementById("game-btn");
const libraryScreen = document.getElementById("library-screen");
const readerScreen = document.getElementById("reader-screen");
const vocabScreen = document.getElementById("vocab-screen");

export let currentPage = 1;
export let totalPages = 0;
export let currentPdf = null;

export function setCurrentPdf(pdf) {
  currentPdf = pdf;
}

export function setTotalPages(pages) {
  totalPages = pages;
}

export function setCurrentPage(page) {
  currentPage = page;
}

renderLibrary();

gameBtn.addEventListener("click", () => {
  const isVocabHidden = vocabScreen.classList.contains("hidden");

  if (isVocabHidden) {
    libraryScreen.classList.add("hidden");
    readerScreen.classList.add("hidden");
    vocabScreen.classList.remove("hidden");

    renderVocabulary();

    gameBtn.textContent = "Моя библиотека";
  } else {
    vocabScreen.classList.add("hidden");
    readerScreen.classList.add("hidden");
    libraryScreen.classList.remove("hidden");

    gameBtn.textContent = "Мой словарь";
  }
});
