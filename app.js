pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

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
const playAudioBtn = document.getElementById("play-audio-btn");
const addToVocabBtn = document.getElementById("add-to-vocab-btn");
const booksGrid = document.getElementById("books-grid");

renderLibrary();

backBtn.addEventListener("click", () => {
  readerScreen.classList.add("hidden");
  libraryScreen.classList.remove("hidden");
  renderLibrary();
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
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const existingBook = books.find((book) => book.title === file.name);

      console.log("Книга открыта, всего страниц:", pdf.numPages);

      bookTitle.textContent = file.name;
      readerScreen.classList.remove("hidden");
      libraryScreen.classList.add("hidden");

      if (existingBook) {
        currentPdf = pdf;
        totalPages = pdf.numPages;
        currentPage = existingBook.currentPage;
      }

      if (!existingBook) {
        currentPdf = pdf;
        totalPages = pdf.numPages;
        currentPage = 1;

        const newColor = getRandomColor();
        const newBook = {
          title: file.name,
          currentPage: 1,
          totalPages: pdf.numPages,
          coverColor: newColor,
        };

        books.push(newBook);
        localStorage.setItem("books", JSON.stringify(books));
      }

      idbKeyval.set(file.name, file);
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
    updateBookProgress();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
    updateBookProgress();
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

function getRandomColor() {
  const colors = [
    "#357abd",
    "#0a7336",
    "#e67e22",
    "#ac0fea",
    "#1abc9c",
    "#e74c3c",
    "#ea2070",
    "#3f1d96",
  ];
  const randomindex = Math.floor(Math.random() * colors.length);

  return colors[randomindex];
}

function updateBookProgress() {
  const books = JSON.parse(localStorage.getItem("books")) || [];

  const currentBook = books.find(
    (book) => book.title === bookTitle.textContent,
  );

  if (currentBook) {
    currentBook.currentPage = currentPage;
    localStorage.setItem("books", JSON.stringify(books));
  }
}

function renderLibrary() {
  booksGrid.innerHTML = "";

  const books = JSON.parse(localStorage.getItem("books")) || [];

  books.forEach((book) => {
    const percent = Math.round((book.currentPage / book.totalPages) * 100);

    const bookCard = ` <div class="book-card">
            <div class="book-cover" style="background-color: ${book.coverColor}"></div>
            <button class="delete-book-btn">✕</button>
            <h3 class="book-title">${book.title}</h3>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percent}%; background-color: ${book.coverColor}"></div>
            </div>
          </div>`;

    booksGrid.insertAdjacentHTML("beforeend", bookCard);

    const card = booksGrid.lastElementChild;
    const deleteBtn = card.querySelector(".delete-book-btn");

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await idbKeyval.del(book.title);
      const updatedBooks = books.filter((b) => b.title !== book.title);
      localStorage.setItem("books", JSON.stringify(updatedBooks));
      renderLibrary();
    });

    card.addEventListener("click", async () => {
      const file = await idbKeyval.get(book.title);

      if (!file) {
        alert("File not found on memory");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
          currentPdf = pdf;
          totalPages = pdf.numPages;
          currentPage = book.currentPage;
          bookTitle.textContent = book.title;
          readerScreen.classList.remove("hidden");
          libraryScreen.classList.add("hidden");
          renderPage(currentPage);
        });
      };
      reader.readAsArrayBuffer(file);
    });
  });
}
