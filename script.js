const tarotDeck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

let shuffledDeck = [];
let selectedCards = [];
let userTopic = "";

const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepLoading = document.getElementById('step-loading');
const step3 = document.getElementById('step-3');
const cardsContainer = document.getElementById('cards-container');
const displayArea = document.getElementById('selected-cards-display');
const aiResponse = document.getElementById('ai-response');

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

document.getElementById('start-btn').addEventListener('click', () => {
    userTopic = document.getElementById('user-topic').value.trim();

    if (!userTopic) {
        alert("Vui lòng nhập chủ đề bạn muốn xem!");
        return;
    }

    selectedCards = [];
    shuffledDeck = shuffleArray(tarotDeck);
    cardsContainer.innerHTML = "";

    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    step3.classList.add('hidden');
    
    renderDeck();
});

function renderDeck() {
    for (let i = 0; i < 22; i++) {
        const card = document.createElement('div');
        card.classList.add('tarot-card');
        card.dataset.index = i;
        card.addEventListener('click', () => selectCard(card, i));
        cardsContainer.appendChild(card);
    }
}

function selectCard(element, index) {
    if (selectedCards.length >= 3 || element.classList.contains('selected')) return;

    element.classList.add('selected');

    const cardName = shuffledDeck[index];
    const positions = ["Quá khứ", "Hiện tại", "Tương lai"];
    
    selectedCards.push({
        name: cardName,
        position: positions[selectedCards.length]
    });

    if (selectedCards.length === 3) {
        setTimeout(getReading, 800);
    }
}

async function getReading() {
    step2.classList.add('hidden');
    stepLoading.classList.remove('hidden');
    displayArea.innerHTML = "";

    // Hiển thị 3 lá bài
    selectedCards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'revealed-card glass';
        div.innerHTML = `
            <div style="font-size: 2rem; color: #4fc3f7;"><i class="fa-solid fa-moon"></i></div>
            <div class="card-name">${card.name}</div>
            <small>${card.position}</small>
        `;
        displayArea.appendChild(div);
    });

    const prompt = `
    Tôi muốn xem bói Tarot về chủ đề: "${userTopic}".
    Tôi đã bốc được 3 lá bài:
    1. ${selectedCards[0].name} – Quá khứ
    2. ${selectedCards[1].name} – Hiện tại
    3. ${selectedCards[2].name} – Tương lai

    Hãy đóng vai một Tarot Reader chuyên nghiệp, giọng văn huyền bí, thấu cảm và tích cực. 
    Giải thích ý nghĩa từng lá bài gắn với chủ đề và đưa ra lời khuyên tổng kết ngắn gọn. 
    Dùng định dạng HTML cơ bản (như <p>, <strong>) để trình bày đẹp mắt.
    `;

    try {
        const workerUrl = "https://boitarot-api.shiroboyy.workers.dev"; // Kiểm tra lại link này

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Bạn là một Tarot Reader huyền bí." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        // --- ĐOẠN DEBUG QUAN TRỌNG ---
        console.log("LOG TỪ SERVER:", data); 

        // 1. Kiểm tra lỗi từ Worker
        if (data.error) {
            let msg = data.error.message || JSON.stringify(data.error);
            throw new Error("Lỗi Server: " + msg);
        }

        // 2. Kiểm tra format dữ liệu
        if (!data.choices || !data.choices[0]) {
            if (data.candidates) throw new Error("Lỗi: Worker vẫn đang dùng code cũ (Gemini). Hãy Deploy lại code Groq!");
            throw new Error("Server trả về dữ liệu rỗng!");
        }

        // Lấy nội dung
        const content = data.choices[0].message.content;

        stepLoading.classList.add('hidden');
        step3.classList.remove('hidden');
        aiResponse.innerHTML = content;

    } catch (error) {
        console.error(error);
        alert("⚠️ CÓ LỖI: " + error.message); // Hiện thông báo lỗi lên màn hình
        stepLoading.classList.add('hidden');
        step1.classList.remove('hidden');
    }
}









