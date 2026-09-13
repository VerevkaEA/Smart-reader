import { renderLibrary } from './library.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

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
