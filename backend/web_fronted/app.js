document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const connectBtn = document.getElementById('connectBtn');
    const copyBtn = document.getElementById('copyBtn');
    const pinInput = document.getElementById('pinInput');
    const playerNameInput = document.getElementById('playerName');
    const statusText = document.getElementById('statusText');
    const connectionStatus = document.getElementById('connectionStatus');
    const micStatus = document.getElementById('micStatus');
    const gameStatus = document.getElementById('gameStatus');
    const messageBox = document.getElementById('messageBox');

    let ws = null;
    let audioCtx = null;
    let micStream = null;

    // 1. ระบบคัดลอก PIN ในคลิกเดียว
    copyBtn.addEventListener('click', async () => {
        const pinValue = pinInput.value.trim();
        if (!pinValue) {
            showMessage('กรุณากรอกหรือรับรหัส PIN ก่อนคัดลอก', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(pinValue);
            const originalText = copyBtn.innerText;
            copyBtn.innerText = 'คัดลอกแล้ว!';
            setTimeout(() => copyBtn.innerText = originalText, 1500);
        } catch (err) {
            // Fallback กรณี Clipboard API ถูกบล็อก
            pinInput.select();
            document.execCommand('copy');
            showMessage('คัดลอกรหัสเรียบร้อย', 'success');
        }
    });

    // 2. ปลุกระบบ Audio (ปลดล็อกข้อจำกัดของมือถือ)
    async function initAudio() {
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            micStatus.innerText = 'เปิดใช้งาน';
            micStatus.className = 'status-value green';
            return true;
        } catch (err) {
            micStatus.innerText = 'ไม่อนุญาต';
            micStatus.className = 'status-value red';
            showMessage('กรุณากดอนุญาตให้ใช้งานไมโครโฟนบนเบราว์เซอร์', 'error');
            return false;
        }
    }

    // 3. เชื่อมต่อ WebSocket
    function connectWebSocket() {
        const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = protocol + location.host;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            statusText.innerText = 'ออนไลน์';
            connectionStatus.className = 'status-badge online';
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // รับ PIN จากเซิร์ฟเวอร์ (ถ้ามี)
                if (data.pin) {
                    pinInput.value = data.pin;
                }

                if (data.status === 'success') {
                    gameStatus.innerText = 'เชื่อมต่อแล้ว';
                    gameStatus.className = 'status-value green';
                    showMessage('ยืนยันตัวตนสำเร็จ! พร้อมใช้งานเสียง', 'success');
                } else if (data.status === 'error') {
                    showMessage(data.message || 'รหัส PIN ไม่ถูกต้อง', 'error');
                }
            } catch (e) {
                console.log('Plain text received:', event.data);
            }
        };

        ws.onclose = () => {
            statusText.innerText = 'ออฟไลน์';
            connectionStatus.className = 'status-badge offline';
            setTimeout(connectWebSocket, 3000); // พยายามเชื่อมต่อใหม่ทุก 3 วินาที
        };
    }

    // 4. ปุ่มกดเชื่อมต่อและยืนยันตัวตน
    connectBtn.addEventListener('click', async () => {
        const name = playerNameInput.value.trim();
        const pin = pinInput.value.trim();

        if (!name || !pin) {
            showMessage('กรุณากรอกชื่อในเกมและรหัส PIN ให้ครบถ้วน', 'error');
            return;
        }

        // เริ่มต้นไมค์
        const audioReady = await initAudio();
        if (!audioReady) return;

        // ส่งข้อมูลไปยัง Backend
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'verify_pin',
                playerName: name,
                pin: pin
            }));
            showMessage('กำลังตรวจสอบรหัส...', 'success');
        } else {
            showMessage('เซิร์ฟเวอร์ออฟไลน์ ไม่สามารถส่งข้อมูลได้', 'error');
        }
    });

    function showMessage(text, type) {
        messageBox.innerText = text;
        messageBox.className = `message-box ${type}`;
    }

    // เริ่มการเชื่อมต่อ WebSocket ทันทีที่โหลดหน้าเว็บ
    connectWebSocket();
});
