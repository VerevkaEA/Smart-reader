pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cloudflare.com';

const testBookCard = document.querySelector(".book-card");
const libraryScreen = document.getElementById("library-screen");
const readerScreen = document.getElementById("reader-screen");
const backBtn = document.getElementById("back-to-library-btn");
const fileInput = document.getElementById("file-input");
const bookTitle = document.getElementById("reader-book-title");
const bookTextContent = document.getElementById("book-text-content");

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

      pdf.getPage(1).then((page) => {
        page.getTextContent().then((textContent) => {
          const text = textContent.items.map((item) => item.str).join(" ");
          bookTextContent.textContent = text;
        });
      });
    });
  };
  
  reader.readAsArrayBuffer(file);
});
