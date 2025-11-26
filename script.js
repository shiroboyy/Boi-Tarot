// --- CẤU HÌNH ---
// Link Cloudflare Worker của bạn (Đã sửa đúng https)
const workerUrl = "https://boitarot-api.shiroboyy.workers.dev";

const tarotDeck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

let shuffledDeck = [];
let selectedCards = [];
let userTopic = "";

// Lấy các element từ HTML
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepLoading = document.getElementById('step-loading');
const step3 = document.getElementById('step-3');
const cardsContainer = document.getElementById('cards-container');
const displayArea = document.getElementById('selected-cards-display');
const aiResponse = document.getElementById('ai-response');

// Hàm xáo trộn bài
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Bắt sự kiện nút Bắt đầu
document.getElementById('start-btn').addEventListener('click', () => {
    userTopic = document.getElementById('user-topic').value.trim();

    if (!userTopic) {
        alert("Vui lòng nhập chủ đề bạn muốn xem!");
        return;
    }

    // Reset lại game
    selectedCards = [];
    shuffledDeck = shuffleArray(tarotDeck);
    cardsContainer.innerHTML = "";

    // Chuyển bước
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    step3.classList.add('hidden');
    
    renderDeck();
});

// Hàm hiển thị bộ bài úp
function renderDeck() {
    for (let i = 0; i < 22; i++) {
        const card = document.createElement('div');
        card.classList.add('tarot-card');
        card.dataset.index = i;
        
        // Hiệu ứng hiện lần lượt
        card.style.animation = `fadeIn 0.5s ease ${i * 0.05}s forwards`;
        card.style.opacity = '0';

        card.addEventListener('click', () => selectCard(card, i));
        cardsContainer.appendChild(card);
    }
}

// Hàm chọn bài
function selectCard(element, index) {
    if (selectedCards.length >= 3 || element.classList.contains('selected')) return;

    element.classList.add('selected');

    const cardName = shuffledDeck[index];
    const positions = ["Quá khứ", "Hiện tại", "Tương lai"];
    
    selectedCards.push({
        name: cardName,
        position: positions[selectedCards.length]
    });

    // Nếu đủ 3 lá thì gọi API
    if (selectedCards.length === 3) {
        setTimeout(getReading, 800);
    }
}

// Hàm gọi API lấy lời giải
async function getReading() {
    step2.classList.add('hidden');
    stepLoading.classList.remove('hidden');

    displayArea.innerHTML = "";

    // Hiển thị 3 lá bài đã chọn ra màn hình
    selectedCards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'revealed-card glass';
        div.innerHTML = `
            <div style="font-size: 2rem; color: #4fc3f7;">
                <i class="fa-solid fa-moon"></i>
            </div>
            <div class="card-name">${card.name}</div>
            <small>${card.position}</small>
        `;
        displayArea.appendChild(div);
    });

    // --- PROMPT "THẦN THÁNH" (Ép trả về HTML đẹp) ---
    const prompt = `
    Đóng vai là một Master Tarot Reader chuyên nghiệp. 
    Tuyệt đối KHÔNG dùng định dạng Markdown (như **bold**, - list). 
    CHỈ trả về kết quả dưới dạng HTML thô (Raw HTML) để hiển thị lên web.

    Thông tin:
    - Chủ đề: "${userTopic}"
    - Lá 1 (Quá khứ): ${selectedCards[0].name}
    - Lá 2 (Hiện tại): ${selectedCards[1].name}
    - Lá 3 (Tương lai): ${selectedCards[2].name}

    Hãy điền nội dung giải bài vào đúng cấu trúc HTML dưới đây (Giữ nguyên các thẻ HTML, chỉ thay nội dung):

    <div class="reading-result">
        <p style="font-style: italic; color: #bbb; border-left: 3px solid #4fc3f7; padding-left: 10px; margin-bottom: 20px;">
            "Vũ trụ đã nghe thấy câu hỏi của bạn về <strong>${userTopic}</strong>. Dưới đây là thông điệp dành riêng cho bạn."
        </p>

        <div style="margin-bottom: 15px;">
            <h4 style="color: #4fc3f7; margin-bottom: 5px; text-transform: uppercase;">1. Quá khứ: ${selectedCards[0].name}</h4>
            <p style="margin-top: 0; line-height: 1.6;">[Viết lời giải thích cho lá bài quá khứ tại đây...]</p>
        </div>

        <div style="margin-bottom: 15px;">
            <h4 style="color: #4fc3f7; margin-bottom: 5px; text-transform: uppercase;">2. Hiện tại: ${selectedCards[1].name}</h4>
            <p style="margin-top: 0; line-height: 1.6;">[Viết lời giải thích cho lá bài hiện tại, tập trung vào năng lượng ngay lúc này...]</p>
        </div>

        <div style="margin-bottom: 15px;">
            <h4 style="color: #4fc3f7; margin-bottom: 5px; text-transform: uppercase;">3. Tương lai: ${selectedCards[2].name}</h4>
            <p style="margin-top: 0; line-height: 1.6;">[Dự đoán xu hướng tương lai và kết quả tiềm năng...]</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed #4fc3f7; margin-top: 25px;">
            <strong style="color: #ffeb3b; display: block; margin-bottom: 10px;">🔮 Lời khuyên từ Vũ trụ:</strong>
            <p style="margin: 0;">[Viết lời khuyên tổng kết ngắn gọn, chữa lành và tích cực tại đây...]</p>
        </div>
    </div>
    `;

    try {
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

        // Debug: Xem log nếu có lỗi
        console.log("LOG TỪ SERVER:", data);

        // 1. Kiểm tra lỗi từ Worker/Groq
        if (data.error) {
            let msg = data.error.message || JSON.stringify(data.error);
            throw new Error("Lỗi Server: " + msg);
        }

        // 2. Kiểm tra format dữ liệu
        if (!data.choices || !data.choices[0]) {
            if (data.candidates) throw new Error("Lỗi: Worker chưa cập nhật code Groq (Vẫn dùng Gemini). Hãy Deploy lại Worker!");
            throw new Error("Server trả về dữ liệu rỗng!");
        }

        // 3. Lấy nội dung trả về
        let content = data.choices[0].message.content;

        // --- BƯỚC LÀM SẠCH QUAN TRỌNG ---
        // Đôi khi AI trả về ```html ... ```, ta cần xóa nó đi để hiển thị đẹp
        content = content.replace(/```html/g, "").replace(/```/g, "");

        stepLoading.classList.add('hidden');
        step3.classList.remove('hidden');
        aiResponse.innerHTML = content;

    } catch (error) {
        console.error(error);
        alert("⚠️ CÓ LỖI: " + error.message);
        stepLoading.classList.add('hidden');
        step1.classList.remove('hidden');
    }
}

