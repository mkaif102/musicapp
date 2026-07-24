/**
 * JioSaavn Unofficial API Service
 *
 * Provides search, artist, album, and trending functionality
 * using the JioSaavn web API. Media URLs are DES-ECB decrypted
 * inline — no external crypto dependencies required.
 */

const BASE_URL = 'https://www.jiosaavn.com/api.php';

const DEFAULT_PARAMS = {
  _format: 'json',
  _marker: 0,
  api_version: 4,
  ctx: 'web6dot0',
};

const DES_KEY = [0x33, 0x38, 0x33, 0x34, 0x36, 0x35, 0x39, 0x31]; // ASCII "38346591"

// ──────────────────────────────────────────────────────────────
// DES-ECB decryption using crypto-js (pure JS, no native deps)
// ──────────────────────────────────────────────────────────────

import CryptoJS from 'crypto-js';

const DES_KEY_WORD = CryptoJS.enc.Utf8.parse('38346591');

// ── Base64 ──

export function decryptUrl(encryptedUrl) {
  if (!encryptedUrl) return '';
  try {
    const encrypted = CryptoJS.enc.Base64.parse(encryptedUrl);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: encrypted },
      DES_KEY_WORD,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.log('JioSaavn DES decrypt error:', e.message || e);
    return '';
  }
}

export function setQuality(url, quality = 320) {
  if (!url) return '';
  return url.replace(/_\d+(?=\.\w+$)/, `_${quality}`);
}

// ──────────────────────────────────────────────────────────────
// API helpers
// ──────────────────────────────────────────────────────────────

async function apiCall(params) {
  const qs = new URLSearchParams({ ...DEFAULT_PARAMS, ...params }).toString();
  const res = await fetch(`${BASE_URL}?${qs}`);
  if (!res.ok) throw new Error(`JioSaavn API error: ${res.status}`);
  return res.json();
}

function toSong(item) {
  const mi = item.more_info || {};

  const artwork =
    (item.image && typeof item.image === 'string'
      ? item.image
      : item.image && item.image.length
        ? item.image[item.image.length - 1]?.link || item.image[item.image.length - 1]?.url || ''
        : '') || '';

  const encryptedUrl =
    mi.encURL ||
    mi.encrypted_media_url ||
    mi.media_preview_url ||
    '';

  let artistName = 'Unknown Artist';
  if (mi.artistMap?.primary_artists?.length) {
    artistName = mi.artistMap.primary_artists.map(a => a.name).join(', ');
  } else {
    artistName = (mi.music || mi.singers || item.artist || item.primaryArtists || 'Unknown Artist');
  }

  const duration = mi.duration || item.duration || '0';
  let durationStr = '0:00';
  const secs = parseInt(duration, 10);
  if (!isNaN(secs) && secs > 0) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    durationStr = `${m}:${s.toString().padStart(2, '0')}`;
  } else if (typeof duration === 'string' && duration.includes(':')) {
    durationStr = duration;
  }

  return {
    id: item.id || item.songid || '',
    title: (item.title || '').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
    artist: artistName.replace(/&amp;/g, '&').replace(/&#039;/g, "'"),
    album: (mi.album || item.album || item.subtitle || '').replace(/&amp;/g, '&'),
    duration: durationStr,
    url: encryptedUrl.startsWith('http') ? encryptedUrl : decryptUrl(encryptedUrl),
    artwork: artwork.replace('150x150', '500x500'),
    language: mi.language || item.language || '',
  };
}

function toArtist(item) {
  const img =
    (item.image && typeof item.image === 'string'
      ? item.image
      : item.image && item.image.length
        ? item.image[item.image.length - 1]?.link || ''
        : '') || '';
  return {
    id: item.id || item.artistId || '',
    name: item.name || 'Unknown Artist',
    image: img.replace('150x150', '500x500'),
  };
}

function toAlbum(item) {
  const img =
    (item.image && typeof item.image === 'string'
      ? item.image
      : item.image && item.image.length
        ? item.image[item.image.length - 1]?.link || ''
        : '') || '';
  return {
    id: item.id || '',
    title: (item.title || '').replace(/&amp;/g, '&'),
    artist: (item.artist || item.primaryArtists || 'Unknown Artist').replace(/&amp;/g, '&'),
    image: img.replace('150x150', '500x500'),
    songsCount: item.songCount || item.songs?.length || 0,
  };
}

// ──────────────────────────────────────────────────────────────
// Exported API functions
// ──────────────────────────────────────────────────────────────

export async function searchSongs(query, limit = 50) {
  if (!query || !query.trim()) return [];
  try {
    const data = await apiCall({
      __call: 'search.getResults',
      p: 1,
      n: limit,
      cc: 'in',
      q: query.trim(),
    });
    return (data.results || []).map(toSong);
  } catch (e) {
    console.log('JioSaavn searchSongs failed:', e.message || e);
    return [];
  }
}

export async function searchAll(query) {
  if (!query || !query.trim()) return { songs: [], albums: [], artists: [] };
  try {
    const data = await apiCall({
      __call: 'autocomplete.get',
      cc: 'in',
      q: query.trim(),
    });
    return {
      songs: (data.songs?.data || []).map(toSong),
      albums: (data.albums?.data || []).map(toAlbum),
      artists: (data.artists?.data || []).map(toArtist),
    };
  } catch (e) {
    console.log('JioSaavn searchAll failed:', e.message || e);
    return { songs: [], albums: [], artists: [] };
  }
}

export async function getSongById(id) {
  if (!id) return null;
  try {
    const data = await apiCall({
      __call: 'song.getDetails',
      pids: id,
    });
    const list = data.songs || data;
    const item = Array.isArray(list) ? list[0] : list;
    return item ? toSong(item) : null;
  } catch (e) {
    console.log('JioSaavn getSongById failed:', e.message || e);
    return null;
  }
}

export async function getAlbumDetails(id) {
  if (!id) return { album: null, songs: [] };
  try {
    const data = await apiCall({
      __call: 'content.getAlbumDetails',
      id,
      cc: 'in',
    });
    return {
      album: {
        id: data.id || id,
        title: (data.title || '').replace(/&amp;/g, '&'),
        artist: (data.primaryArtists || data.artist || 'Unknown Artist').replace(/&amp;/g, '&'),
        image: (data.image || '').replace('150x150', '500x500'),
        songsCount: data.songCount || data.songs?.length || 0,
      },
      songs: (data.songs || []).map(toSong),
    };
  } catch (e) {
    console.log('JioSaavn getAlbumDetails failed:', e.message || e);
    return { album: null, songs: [] };
  }
}

export async function getArtistDetails(id) {
  if (!id) return null;
  try {
    const data = await apiCall({
      __call: 'artist.getArtistPageDetails',
      artistId: id,
      cc: 'in',
    });
    return {
      id: data.artistId || id,
      name: data.name || 'Unknown Artist',
      image: (data.image || '').replace('150x150', '500x500'),
      topSongs: (data.topSongs || []).map(toSong),
      topAlbums: (data.topAlbums || []).map(toAlbum),
      singles: (data.singles || []).map(toSong),
      similarArtists: (data.similarArtists || []).map(toArtist),
    };
  } catch (e) {
    console.log('JioSaavn getArtistDetails failed:', e.message || e);
    return null;
  }
}

export async function getArtistSongs(id, page = 1, limit = 50) {
  if (!id) return [];
  try {
    const data = await apiCall({
      __call: 'artist.getArtistMoreSong',
      artistId: id,
      page,
      n: limit,
      cc: 'in',
    });
    return (data.songs || data.data || []).map(toSong);
  } catch (e) {
    console.log('JioSaavn getArtistSongs failed:', e.message || e);
    return [];
  }
}

export async function getTrending(limit = 20) {
  try {
    const data = await apiCall({
      __call: 'content.getTrending',
      page: 'home',
      cc: 'in',
    });
    const list = data.trending?.songs || data.songs || data.data || [];
    return list.slice(0, limit).map(toSong);
  } catch (e) {
    console.log('JioSaavn getTrending failed:', e.message || e);
    return [];
  }
}

export async function searchSongsByName(query, limit = 50) {
  return searchSongs(query, limit);
}

export default {
  searchSongs,
  searchSongsByName: searchSongs,
  searchAll,
  getSongById,
  getAlbumDetails,
  getArtistDetails,
  getArtistSongs,
  getTrending,
  decryptUrl,
  setQuality,
};
