// Dev only: fires fake reports at a running local API so the board has something to show.
const API = process.env.API ?? "http://127.0.0.1:3020";
const plan = [
  ["sbi", 22, "failed"],
  ["hdfc", 8, "slow"],
  ["icici", 3, "failed"],
  ["kotak", 1, "pending"],
];
const apps = ["gpay", "phonepe", "paytm", undefined];

let n = 0;
for (const [bankId, count, kind] of plan) {
  for (let i = 0; i < count; i++) {
    const res = await fetch(`${API}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": `10.0.${n >> 8}.${n & 255}` },
      body: JSON.stringify({ bankId, kind, appId: apps[i % apps.length], deviceId: `seed-device-${n++}` }),
    });
    if (!res.ok) console.log(bankId, res.status, await res.text());
  }
}
console.log(`sent ${n} reports`);
