const testBookCard=document.querySelector('.book-card')
const libraryScreen=document.getElementById('library-screen')
const readerScreen=document.getElementById('reader-screen')
const backBtn=document.getElementById('back-to-library-btn')

backBtn.addEventListener('click', ()=>{
    readerScreen.classList.add('hidden')
    libraryScreen.classList.remove('hidden')
})

testBookCard.addEventListener('click',()=>{
    readerScreen.classList.remove('hidden')
    libraryScreen.classList.add('hidden')
})