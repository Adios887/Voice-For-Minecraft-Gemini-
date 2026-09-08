const WebSocket = require('ws');
const net = require('net');

const WS_PORT = 3000;  // รับสายจาก Minecraft (/connect) และ Web
const TCP_PORT = 4000; // TCP Proxy สำหรับ Web Renderer Engine

const wss = new WebSocket.Server({ port: WS_PORT });
const activeSessions = new Map(); // { playerName: { x, y, z, rotation, pin, room } }
const pendingPins = new Map();    // { pin: playerName }
const registeredRooms = new Map(); // { roomId: { type: 'world'|'server', host: playerName, ip, port } }

console.log(`[PROXY OS] WebSocket รันที่ ws://localhost:${WS_PORT}`);

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 1. รับข้อมูลจาก Minecraft
            if (data.type === 'mc_sync') {
                data.players.forEach(p => {
                    if (p.pin) pendingPins.set(p.pin, p.name);
                    activeSessions.set(p.name, { ...p, ws });
                });
                broadcast({ type: 'positions_update', players: Array.from(activeSessions.values()) });
            }

            // 2. ยืนยันรหัส PIN 6 หลัก จากเว็บ
            if (data.type === 'verify_pin') {
                const { pin, playerName } = data;
                const matchedPlayer = pendingPins.get(pin);

                if (matchedPlayer && matchedPlayer.toLowerCase() === playerName.toLowerCase()) {
                    ws.send(JSON.stringify({ status: 'success', message: 'เชื่อมต่อสำเร็จ!', player: matchedPlayer }));
                    pendingPins.delete(pin);
                } else {
                    ws.send(JSON.stringify({ status: 'error', message: 'รหัส 6 หลัก หรือชื่อ Player ไม่ถูกต้อง' }));
                }
            }

            // 3. ลงทะเบียนและดึงรายชื่อห้อง (World/Server Host)
            if (data.type === 'register_room') {
                registeredRooms.set(data.roomId, data.roomData);
                broadcast({ type: 'rooms_update', rooms: Array.from(registeredRooms.entries()) });
            }
        } catch (err) {
            console.error('[Error]:', err.message);
        }
    });
});

function broadcast(payload) {
    const msg = JSON.stringify(payload);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
        }
