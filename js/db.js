// ============================================
//  db.js - Google Sheets Database (Optimized)
// ============================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbx-WThO1XRdECkzYW70CSbxcCO1PZ60F2l4nuUDhkylRwvx7hqubK659q-BZo4xZ3GT/exec";

let _cache = null;

async function _getAll() {
  if (_cache) return _cache; // pakai cache kalau sudah ada
  const r = await fetch(API_URL + "?action=getAll");
  const d = await r.json();
  _cache = d.assets || [];
  return _cache;
}

function _invalidateCache() {
  _cache = null; // hapus cache setelah ada perubahan
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

// Load sekali, tidak polling otomatis
function listenAssets(callback) {
  async function load() {
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

  load();
  return () => {}; // tidak ada interval yang perlu dibersihkan
}

async function addAsset(asset) {
  const newAsset = { id: _genId(), ...asset };
  await _post({ action: "add", data: newAsset });
  _invalidateCache();
  if (_cache) _cache.unshift(newAsset); // update cache lokal langsung
  return newAsset.id;
}

async function addAssets(assetList) {
  const assets = assetList.map((a) => ({ id: _genId(), ...a }));
  await _post({ action: "bulkAdd", data: assets });
  _invalidateCache();
}

async function updateAsset(id, updates) {
  await _post({ action: "update", id, data: updates });
  // update cache lokal langsung tanpa reload
  if (_cache) {
    const idx = _cache.findIndex((a) => a.id === id);
    if (idx !== -1) _cache[idx] = { ..._cache[idx], ...updates };
  }
}

async function deleteAsset(id) {
  await _post({ action: "delete", id });
  // update cache lokal langsung tanpa reload
  if (_cache) _cache = _cache.filter((a) => a.id !== id);
}

export { listenAssets, addAsset, addAssets, updateAsset, deleteAsset };
