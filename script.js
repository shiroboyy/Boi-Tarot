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

    // Hiển thị bài đã chọn
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
    3. ${selectedCards[2].name} – Tương lai.
    Hãy giải thích ý nghĩa và đưa ra lời khuyên.`;

    try {
        // --- GỌI API ---
        const workerUrl = "https://boitarot-api.shiroboyy.workers.dev"; // Kiểm tra lại link này xem đúng chưa

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Bạn là một Tarot Reader chuyên nghiệp." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        // --- BẮT LỖI 400/500 TẠI ĐÂY ---
        console.log("LOG TỪ SERVER:", data); // Bật F12 xem cái này

        // 1. Nếu Worker báo lỗi (ví dụ: Thiếu key, Sai model...)
        if (data.error) {
            let msg = "";
            if (typeof data.error === 'string') msg = data.error;
            else if (data.error.message) msg = data.error.message;
            else msg = JSON.stringify(data.error);
            
            throw new Error("LỖI TỪ SERVER: " + msg);
        }

        // 2. Nếu dữ liệu trả về không đúng chuẩn Groq
        if (!data.choices || !data.choices[0]) {
            throw new Error("Server không trả về kết quả bói. Kiểm tra lại Code Worker!");
        }

        // --- NẾU THÀNH CÔNG ---
        const content = data.choices[0].message.content;

        stepLoading.classList.add('hidden');
        step3.classList.remove('hidden');
        aiResponse.innerHTML = content;

    } catch (error) {
        console.error(error);
        // Hiện lỗi ra màn hình cho bạn đọc
        alert("⚠️ CÓ LỖI XẢY RA:\n" + error.message);
        
        stepLoading.classList.add('hidden');
        step1.classList.remove('hidden');
    }
}







