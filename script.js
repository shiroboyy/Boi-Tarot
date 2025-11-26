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
    Đóng vai là một Master Tarot Reader với 20 năm kinh nghiệm, có khả năng thấu cảm sâu sắc và trực giác mạnh mẽ.
    
    Thông tin khách hàng:
    - Chủ đề muốn xem: "${userTopic}"
    - Các lá bài đã bốc:
      1. Quá khứ: ${selectedCards[0].name}
      2. Hiện tại: ${selectedCards[1].name}
      3. Tương lai: ${selectedCards[2].name}

    Nhiệm vụ của bạn:
    Hãy giải bài một cách huyền bí, nhẹ nhàng nhưng thực tế và đưa ra lời khuyên chữa lành (healing).
    
    Yêu cầu về định dạng (BẮT BUỘC TRẢ VỀ HTML):
    Không được dùng Markdown (như ** hay ##), chỉ dùng thẻ HTML. Cấu trúc câu trả lời như sau:

    <div class="reading-result">
        <p><i>Xin chào, vũ trụ đã nghe thấy câu hỏi của bạn về chủ đề <strong>${userTopic}</strong>. Dưới đây là thông điệp dành riêng cho bạn:</i></p>
        <hr>
        
        <h4>1. Quá khứ: ${selectedCards[0].name}</h4>
        <p>[Giải thích ý nghĩa lá bài trong bối cảnh quá khứ, những gì đã hình thành nên tình huống này]</p>
        
        <h4>2. Hiện tại: ${selectedCards[1].name}</h4>
        <p>[Giải thích năng lượng hiện tại, những thuận lợi hoặc thách thức đang đối mặt]</p>
        
        <h4>3. Tương lai: ${selectedCards[2].name}</h4>
        <p>[Dự đoán xu hướng sắp tới nếu tiếp tục theo dòng năng lượng này]</p>
        
        <div class="advice-box" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-top: 20px; border: 1px dashed #4fc3f7;">
            <strong>🔮 Lời khuyên từ Vũ trụ:</strong>
            <p>[Lời khuyên tổng kết ngắn gọn, tích cực và định hướng hành động cụ thể]</p>
        </div>
    </div>
    
    Hãy viết bằng tiếng Việt, giọng văn ấm áp, sâu sắc và truyền cảm hứng.
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










