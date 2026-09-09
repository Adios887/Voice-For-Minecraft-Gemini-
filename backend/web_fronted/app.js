document.addEventListener('DOMContentLoaded', () => {
    // Elements - Mode Controls
    const btnModeLocal = document.getElementById('btnModeLocal');
    const btnModeServer = document.getElementById('btnModeServer');
    const subOptionsLocal = document.getElementById('subOptionsLocal');
    const subOptionsServer = document.getElementById('subOptionsServer');

    const btnLocalJoin = document.getElementById('btnLocalJoin');
    const btnLocalHost = document.getElementById('btnLocalHost');
    const btnServerJoin = document.getElementById('btnServerJoin');
    const btnServerHost = document.getElementById('btnServerHost');

    // Elements - Dynamic Forms
    const inputForm = document.getElementById('inputForm');
    const groupServerAddr = document.getElementById('groupServerAddr');
    const groupHostPlayer = document.getElementById('groupHostPlayer');
    const groupPlayerName = document.getElementById('groupPlayerName');
    const groupPin = document.getElementById('groupPin');

    const btnSubmitConnect = document.getElementById('btnSubmitConnect');
    const statusMessage = document.getElementById('statusMessage');

    // Elements - Dashboard Voice Controls
    const stepConnection = document.getElementById('stepConnection');
    const stepVoiceDashboard = document.getElementById('stepVoiceDashboard');
    const btnToggleMic = document.getElementById('btnToggleMic');
    const btnDisconnect = document.getElementById('btnDisconnect');
    const copyCmdBtn = document.getElementById('copyCmdBtn');

    let selectedMainMode = null; // 'local' | 'server'
    let selectedSubMode = null;  // 'join' | 'host'
    let isMicOn = true;

    // ปุ่มคัดลอกคำสั่ง
    copyCmdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('cmdText').innerText);
        copyCmdBtn.innerText = 'คัดลอกแล้ว!';
        setTimeout(() => copyCmdBtn.innerText = '📋 คัดลอก', 1500);
    });

    // 1. เลือกตัวเลือกหลัก (โลกส่วนตัว / เซิร์ฟเวอร์)
    btnModeLocal.addEventListener('click', () => {
        selectedMainMode = 'local';
        btnModeLocal.classList.add('active');
        btnModeServer.classList.remove('active');
        subOptionsLocal.classList.remove('hidden');
        subOptionsServer.classList.add('hidden');
        resetSubOptions();
    });

    btnModeServer.addEventListener('click', () => {
        selectedMainMode = 'server';
        btnModeServer.classList.add('active');
        btnModeLocal.classList.remove('active');
        subOptionsServer.classList.remove('hidden');
        subOptionsLocal.classList.add('hidden');
        resetSubOptions();
    });

    // 2. เลือกตัวเลือกรอง (เข้าร่วม / สร้าง)
    function resetSubOptions() {
        [btnLocalJoin, btnLocalHost, btnServerJoin, btnServerHost].forEach(btn => btn.classList.remove('active'));
        inputForm.classList.add('hidden');
        selectedSubMode = null;
    }

    function setupFormFields(subMode) {
        selectedSubMode = subMode;
        inputForm.classList.remove('hidden');

        // ซ่อนทุกช่องก่อน
        groupServerAddr.classList.add('hidden');
        groupHostPlayer.classList.add('hidden');
        groupPlayerName.classList.add('hidden');
        groupPin.classList.add('hidden');

        if (selectedMainMode === 'local') {
            if (subMode === 'join') { // เข้าร่วมโลกส่วนตัว (รูปที่ 4820 + 4821)
                groupPlayerName.classList.remove('hidden');
                groupPin.classList.remove('hidden');
            } else if (subMode === 'host') { // สร้างโลกส่วนตัว (รูปที่ 4822)
                groupHostPlayer.classList.remove('hidden');
            }
        } else if (selectedMainMode === 'server') {
            if (subMode === 'join') { // เข้าร่วมเซิร์ฟ (รูปที่ 4819 + 4820 + 4821)
                groupServerAddr.classList.remove('hidden');
                groupPlayerName.classList.remove('hidden');
                groupPin.classList.remove('hidden');
            } else if (subMode === 'host') { // สร้างเซิร์ฟ (รูปที่ 4819 + 4822)
                groupServerAddr.classList.remove('hidden');
                groupHostPlayer.classList.remove('hidden');
            }
        }
    }

    btnLocalJoin.addEventListener('click', (e) => { highlightSub(e.target); setupFormFields('join'); });
    btnLocalHost.addEventListener('click', (e) => { highlightSub(e.target); setupFormFields('host'); });
    btnServerJoin.addEventListener('click', (e) => { highlightSub(e.target); setupFormFields('join'); });
    btnServerHost.addEventListener('click', (e) => { highlightSub(e.target); setupFormFields('host'); });

    function highlightSub(target) {
        [btnLocalJoin, btnLocalHost, btnServerJoin, btnServerHost].forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
    }

    // 3. ปุ่มกดเชื่อมต่อเพื่อเปิด Dashboard
    btnSubmitConnect.addEventListener('click', async () => {
        if (!selectedMainMode || !selectedSubMode) {
            return showMsg('กรุณาเลือกรูปแบบการเชื่อมต่อให้ครบถ้วน');
        }

        // สลับไปหน้า Voice Control Dashboard (รูปที่ 4823 / 4824)
        stepConnection.classList.add('hidden');
        stepVoiceDashboard.classList.remove('hidden');
    });

    // 4. ระบบควบคุมในหน้า Dashboard
    btnToggleMic.addEventListener('click', () => {
        isMicOn = !isMicOn;
        btnToggleMic.innerText = isMicOn ? 'เปิด' : 'ปิด';
        btnToggleMic.classList.toggle('active', isMicOn);
    });

    btnDisconnect.addEventListener('click', () => {
        stepVoiceDashboard.classList.add('hidden');
        stepConnection.classList.remove('hidden');
    });

    // อัปเดตข้อความเปอร์เซ็นต์ Slider
    bindSlider('sliderVoiceInput', 'valVoiceInput', '%');
    bindSlider('sliderVoiceOutput', 'valVoiceOutput', '%');
    bindSlider('sliderDistTalk', 'valDistTalk', ' บล็อก');
    bindSlider('sliderDistHear', 'valDistHear', ' บล็อก');

    function bindSlider(sliderId, valId, unit) {
        const slider = document.getElementById(sliderId);
        const val = document.getElementById(valId);
        slider.addEventListener('input', () => val.innerText = slider.value + unit);
    }

    function showMsg(msg) {
        statusMessage.innerText = msg;
        statusMessage.classList.remove('hidden');
    }
});
