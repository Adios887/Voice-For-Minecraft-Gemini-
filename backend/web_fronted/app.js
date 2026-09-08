const ws = new WebSocket('ws://localhost:3000');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const pannerNodes = new Map();

let localPlayer = "";
let isMuted = false;
let config = { hearingDist: 30, speakingDist: 15 };

// WebSocket Handlers
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.status === 'success') {
        alert('เชื่อมต่อรหัส PIN สำเร็จ!');
        document.getElementById('pinModal').classList.add('hidden');
        document.getElementById('audioDashboard').classList.remove('hidden');
    }

    if (data.type === 'positions_update') {
        processSpatialAudio(data.players);
    }
};

function copyProxy() {
    navigator.clipboard.writeText("/connect 127.0.0.1:3000");
    alert("คัดลอกคำสั่งเรียบร้อย! นำไปวางในช่องแชท Minecraft");
}

function selectMode(mode) {
    document.getElementById('modeSelector').classList.add('hidden');
    document.getElementById('pinModal').classList.remove('hidden');
}

function submitPIN() {
    const pin = document.getElementById('pinInput').value;
    const player = document.getElementById('playerInput').value;
    localPlayer = player;

    ws.send(JSON.stringify({ type: 'verify_pin', pin, playerName: player }));
}

// คำนวณมิติเสียง 3D Spatial Audio
function processSpatialAudio(players) {
    const self = players.find(p => p.name === localPlayer);
    if (!self) return;

    // ตั้งค่าพิกัด Listener (ตัวเรา)
    audioCtx.listener.setPosition(self.x, self.y, self.z);

    players.forEach(p => {
        if (p.name === localPlayer) return;

        // คำนวณระยะห่าง Euclidean Distance
        const dx = p.x - self.x;
        const dy = p.y - self.y;
        const dz = p.z - self.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let panner = pannerNodes.get(p.name);
        if (panner) {
            if (dist > config.hearingDist) {
                panner.setPosition(999, 999, 999); // ตัดเสียงเมื่อเกินระยะ
            } else {
                panner.setPosition(p.x, p.y, p.z);
            }
        }
    });
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    btn.innerText = isMuted ? "🔇 ปิดไมค์อยู่ (Mic Muted)" : "🎙️ เปิดไมค์ (Mic Active)";
    btn.style.background = isMuted ? "#ef4444" : "#3b82f6";
}

function goBack() {
    document.getElementById('audioDashboard').classList.add('hidden');
    document.getElementById('modeSelector').classList.remove('hidden');
}

function disconnectVoice() {
    ws.close();
    location.reload();
}
