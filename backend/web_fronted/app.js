// ดึงการเชื่อมต่อ WebSocket อัตโนมัติผ่าน WSS
const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
const ws = new WebSocket(protocol + location.host);

let audioCtx = null;
let micStream = null;

// ฟังก์ชันขอสิทธิ์ไมโครโฟนและปลุกระบบเสียง (ต้องเรียกใช้งานเมื่อกดปุ่ม)
async function initAudioSystem() {
    try {
        // 1. ขอสิทธิ์ไมโครโฟนจากเบราว์เซอร์
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        // 2. ปลุก AudioContext ให้ทำงานบนมือถือ
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        console.log('[AUDIO] ระบบไมโครโฟนพร้อมใช้งาน');
        return true;
    } catch (err) {
        alert('กรุณากดอนุญาตให้ใช้งานไมโครโฟนในเบราว์เซอร์!');
        console.error('[AUDIO ERROR]', err);
        return false;
    }
}

// ตัวอย่างการผูกปุ่มกดยืนยัน PIN ให้ปลุกระบบไมค์ทันที
async function submitPIN() {
    const audioReady = await initAudioSystem();
    if (!audioReady) return;

    const pin = document.getElementById('pinInput').value;
    const player = document.getElementById('playerInput').value;

    ws.send(JSON.stringify({ type: 'verify_pin', pin, playerName: player }));
}
