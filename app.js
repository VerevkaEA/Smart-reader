pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

let currentPage = 1;
let totalPages = 0;
let currentPdf = null;

const testBookCard = document.querySelector(".book-card");
const libraryScreen = document.getElementById("library-screen");
const readerScreen = document.getElementById("reader-screen");
const backBtn = document.getElementById("back-to-library-btn");
const fileInput = document.getElementById("file-input");
const bookTitle = document.getElementById("reader-book-title");
const bookTextContent = document.getElementById("book-text-content");
const pageCounter = document.getElementById("page-counter");
const prevBtn = document.getElementById("prev-page-btn");
const nextBtn = document.getElementById("next-page-btn");
const dictModal = document.getElementById("dict-modal");
const modalWord = document.getElementById("modal-word");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalTranslation = document.getElementById("modal-translation");
const modalDefinition = document.getElementById("modal-definition");

backBtn.addEventListener("click", () => {
  readerScreen.classList.add("hidden");
  libraryScreen.classList.remove("hidden");
});

testBookCard.addEventListener("click", () => {
  readerScreen.classList.remove("hidden");
  libraryScreen.classList.add("hidden");
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  console.log("Выбран файл:", file.name);

  const reader = new FileReader();
  reader.onload = (e) => {
    const typedarray = new Uint8Array(e.target.result);
    console.log("Файл успешно прочитан в массив байтов!");

    pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
      console.log("Книга открыта, всего страниц:", pdf.numPages);

      bookTitle.textContent = file.name;
      readerScreen.classList.remove("hidden");
      libraryScreen.classList.add("hidden");

      currentPdf = pdf;
      totalPages = pdf.numPages;
      currentPage = 1;

      renderPage(currentPage);
    });
  };

  reader.readAsArrayBuffer(file);
});

function renderPage(pageNumber) {
  currentPdf.getPage(pageNumber).then((page) => {
    page.getTextContent().then((textContent) => {
      const text = textContent.items.map((item) => item.str).join(" ");
      processText(text);
    });
  });

  pageCounter.textContent = `Страница: ${pageNumber} / ${totalPages}`;
}

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderPage(currentPage);
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

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

bookTextContent.addEventListener("click", (e) => {
  const target = e.target;
  const clickedWord = target.textContent
    .replace(/[.,\/#!\$%\^&\*;:{}=\-_~()?"']/g, "")
    .toLowerCase();

  if (target.classList.contains("word")) {
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

document.addEventListener("click", (e) => {
  if (
    !dictModal.contains(e.target) &&
    !e.target.classList.contains("word") &&
    !dictModal.classList.contains("hidden")
  ) {
    dictModal.classList.add("hidden");
  }
});

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
      modalDefinition.textContent = data.definition || "Определение отсутствует";

    })
    .catch((error) => {
      console.error("Ошибка получения данных:", error);
      modalTranslation.textContent = "Translation error";
      modalDefinition.textContent = "Definition error";
    });
}