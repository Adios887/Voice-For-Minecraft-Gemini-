const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ชี้ไปยังโฟลเดอร์หน้าเว็บ Frontend
app.use(express.static(path.join(__dirname, 'web_fronted')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web_fronted', 'index.html'));
});

// หน่วยความจำระบบ
const activeSessions = new Map();
const pendingPins = new Map();

wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 1. รับข้อมูลจาก Minecraft (/connect)
            if (data.type === 'mc_sync' || data.header) {
                // จัดเก็บ/กระจายพิกัด
                broadcast({ type: 'positions_update', data: data });
            }

            // 2. รับยืนยัน PIN จากหน้าเว็บ
            if (data.type === 'verify_pin') {
                const { pin, playerName } = data;
                const matchedPlayer = pendingPins.get(pin);

                if (matchedPlayer && matchedPlayer.toLowerCase() === playerName.toLowerCase()) {
                    ws.send(JSON.stringify({ status: 'success', player: matchedPlayer }));
                    pendingPins.delete(pin);
                } else {
                    ws.send(JSON.stringify({ status: 'error', message: 'รหัส 6 หลักไม่ถูกต้อง' }));
                }
            }
        } catch (err) {
            // รองรับ Plain Text จาก Minecraft Command
        }
    });

    ws.on('close', () => console.log('[WS] Client disconnected'));
});

function broadcast(payload) {
    const msg = JSON.stringify(payload);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

// ใช้ Port ที่ Render กำหนดให้อัตโนมัติ
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SERVER] Online on port ${PORT}`);
});
