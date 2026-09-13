import { 
  currentPage, 
  setCurrentPdf, 
  setTotalPages, 
  setCurrentPage 
} from './app.js';

import { renderPage } from './reader.js';


const booksGrid = document.getElementById("books-grid");
const fileInput = document.getElementById("file-input");
const libraryScreen = document.getElementById("library-screen");
const readerScreen = document.getElementById("reader-screen");
const bookTitle = document.getElementById("reader-book-title");


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
        setCurrentPdf(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(existingBook.currentPage);
      }

      if (!existingBook) {
       setCurrentPdf(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);

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

export function renderLibrary() {
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
          setCurrentPdf(pdf);
        setTotalPages(pdf.numPages);
          setCurrentPage(book.currentPage);
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
