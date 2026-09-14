
export function renderVocabulary() {
    console.log("Screen vocab");

     const vocabList=document.getElementById('vocab-list')
    const vocabCount=document.getElementById('vocab-count')

    vocabList.innerHTML=""

    const vocabulary=JSON.parse(localStorage.getItem("vocabulary")) || [];

    vocabCount.textContent=vocabulary.length

    vocabulary.forEach((item)=>{
        const wordCard=`
        <div class="word-card">
        <button class="delete-word-btn">✕</button>
        <h4>${item.word}</h4>
        <p>${item.translation}</p>
        </div>`

        vocabList.insertAdjacentHTML("beforeend", wordCard);
    
        const card=vocabList.lastElementChild
        const deleteBtn=card.querySelector(".delete-word-btn")

        deleteBtn.addEventListener("click",(e)=>{
            e.stopPropagation()

            const updatedVocabulary=vocabulary.filter((v)=> v.word !== item.word)
            localStorage.setItem("vocabulary", JSON.stringify(updatedVocabulary));
            renderVocabulary();
        })
    })
}
