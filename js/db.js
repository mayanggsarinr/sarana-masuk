// ============================================
//  db.js - JSONBin Database (pengganti Firebase)
// ============================================

const JSONBIN_KEY =
  "$2a$10$dRDjFE2VH1TtnVUM5yC1GeWw3xuLZDedTRL6xPyfZ8tMHTZYqq45e";
const BIN_ID = "69b75002aa77b81da9ea0b23";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const HEADERS = {
  "Content-Type": "application/json",
  "X-Master-Key": JSONBIN_KEY,
};

// Cache lokal supaya cepat
let _cache = null;

async function _getData() {
  const r = await fetch(BASE_URL, { headers: HEADERS });
  const d = await r.json();
  _cache = d.record;
  return _cache;
}

async function _saveData(data) {
  _cache = data;
  await fetch(BASE_URL, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify(data),
  });
}

// Generate ID unik
function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ===== FUNGSI UTAMA =====

// Listen realtime (polling tiap 5 detik)
function listenAssets(callback) {
  let lastCount = -1;

  async function poll() {
    try {
      const data = await _getData();
      const assets = (data.assets || []).sort((a, b) =>
        (b.tglEntry || "").localeCompare(a.tglEntry || ""),
      );
      // Panggil callback kalau data berubah
      if (assets.length !== lastCount) {
        lastCount = assets.length;
        callback(assets);
      } else {
        callback(assets);
      }
      // Sembunyikan error banner
      const banner = document.getElementById("db-error-banner");
      if (banner) banner.style.display = "none";
    } catch (e) {
      console.error("DB error:", e);
      let banner = document.getElementById("db-error-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "db-error-banner";
        banner.style.cssText =
          "position:fixed;top:60px;left:0;right:0;z-index:9999;background:#dc3545;color:white;text-align:center;padding:10px;font-size:13px;font-weight:600";
        document.body.prepend(banner);
      }
      banner.innerHTML =
        "⚠️ Gagal memuat data — cek koneksi internet lalu refresh halaman.";
      banner.style.display = "block";
    }
  }

  poll();
  const interval = setInterval(poll, 5000);
  return () => clearInterval(interval);
}

async function addAsset(asset) {
  const data = await _getData();
  if (!data.assets) data.assets = [];
  const newAsset = { id: _genId(), ...asset };
  data.assets.push(newAsset);
  await _saveData(data);
  return newAsset.id;
}

async function addAssets(assetList) {
  const data = await _getData();
  if (!data.assets) data.assets = [];
  assetList.forEach((asset) => {
    data.assets.push({ id: _genId(), ...asset });
  });
  await _saveData(data);
}

async function updateAsset(id, updates) {
  const data = await _getData();
  const idx = data.assets.findIndex((a) => a.id === id);
  if (idx !== -1) {
    data.assets[idx] = { ...data.assets[idx], ...updates };
    await _saveData(data);
  }
}

async function deleteAsset(id) {
  const data = await _getData();
  data.assets = data.assets.filter((a) => a.id !== id);
  await _saveData(data);
}

export { listenAssets, addAsset, addAssets, updateAsset, deleteAsset };
