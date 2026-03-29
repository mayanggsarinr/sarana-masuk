// ============================================
//  db.js - Google Sheets Database
// ============================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbx-WThO1XRdECkzYW70CSbxcCO1PZ60F2l4nuUDhkylRwvx7hqubK659q-BZo4xZ3GT/exec";

let _cache = null;

async function _getAll() {
  const r = await fetch(API_URL + "?action=getAll");
  const d = await r.json();
  _cache = d.assets || [];
  return _cache;
}

async function _post(body) {
  const r = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return r.json();
}

function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Listen realtime (polling tiap 5 detik)
function listenAssets(callback) {
  async function poll() {
    try {
      const assets = await _getAll();
      assets.sort((a, b) => (b.tglEntry || "").localeCompare(a.tglEntry || ""));
      callback(assets);
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
  const interval = setInterval(poll, 10000);
  return () => clearInterval(interval);
}

async function addAsset(asset) {
  const newAsset = { id: _genId(), ...asset };
  await _post({ action: "add", data: newAsset });
  return newAsset.id;
}

async function addAssets(assetList) {
  const assets = assetList.map((a) => ({ id: _genId(), ...a }));
  await _post({ action: "bulkAdd", data: assets });
}

async function updateAsset(id, updates) {
  await _post({ action: "update", id, data: updates });
}

async function deleteAsset(id) {
  await _post({ action: "delete", id });
}

export { listenAssets, addAsset, addAssets, updateAsset, deleteAsset };
