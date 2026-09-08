const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 1. ชี้ไปยังโฟลเดอร์หน้าเว็บ (เช็กชื่อโฟลเดอร์ใน GitHub ให้ตรง เช่น web_fronted)
app.use(express.static(path.join(__dirname, 'web_fronted')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web_fronted', 'index.html'));
});

// 2. ลอจิก WebSocket สำหรับ Minecraft และ Web App
wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    
    ws.on('message', (message) => {
        // ... โค้ดรับส่งข้อมูล WebSocket เดิมของคุณ ...
    });
});

// 3. Render จะส่งค่า process.env.PORT มาให้โดยอัตโนมัติ
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SYSTEM] Server running on port ${PORT}`);
});
