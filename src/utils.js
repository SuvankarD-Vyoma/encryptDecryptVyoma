import CryptoJS from "crypto-js";

// Default key from your .env file
export const DEFAULT_SECRET_KEY = "$Vyoma@123";

// ==========================================
// 1. CryptoJS Logic (Tab 1)
// ==========================================

export const encryptData = (data, key) => {
  try {
    if (!data) return "";
    const stringData = typeof data === 'object' ? JSON.stringify(data) : data; 
    return CryptoJS.AES.encrypt(stringData, key).toString();
  } catch (e) {
    console.error(e);
    throw new Error("Encryption failed");
  }
};

export const decryptData = (ciphertext, key) => {
  if (!ciphertext) return "";
  
  let cleanCipher = ciphertext.trim();
  
  // Cleanup common copy-paste issues
  if (cleanCipher.startsWith('"') && cleanCipher.endsWith('"')) cleanCipher = cleanCipher.slice(1, -1);
  if (cleanCipher.includes(" ")) cleanCipher = cleanCipher.replace(/ /g, "+");

  // Check for mix-up
  if (!cleanCipher.startsWith("U2FsdGVk") && cleanCipher.length > 20) {
      throw new Error("Format Mismatch: This string looks like AES-GCM (no 'Salted__' prefix). \n\n👉 Switch to the 'AES-GCM' tab.");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cleanCipher, key);
    if (bytes.sigBytes > 0) {
        const text = bytes.toString(CryptoJS.enc.Utf8);
        if (text) {
            try { return JSON.parse(text); } catch { return text; }
        }
    }
  } catch (e) { console.error(e); }

  // Fallback for URL encoded strings
  if (cleanCipher.includes("%")) {
      try {
          const uriDecoded = decodeURIComponent(cleanCipher);
          const bytes = CryptoJS.AES.decrypt(uriDecoded, key);
          const text = bytes.toString(CryptoJS.enc.Utf8);
          if (text) try { return JSON.parse(text); } catch { return text; }
      } catch (e) {}
  }

  throw new Error("Decryption Failed. Check the Key, or try the AES-GCM tab.");
};

// ==========================================
// 2. AES-GCM Logic (Tab 2)
// ==========================================

const GCM_KEY_HEX = "710f5a3bbcb3c168409c47774ba11897be76f08e997085377803271c4d42e961";
const GCM_FIXED_IV_HEX = "aabbccddeeff001122334455"; // 12-byte IV

const hexToUint8Array = (hex) => 
  new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export const encryptAESGCM = async (data) => {
  try {
    if(!data) return "";
    
    // Ensure we encode strings or JSON
    const textString = typeof data === 'object' ? JSON.stringify(data) : data;

    const encoder = new TextEncoder();
    const keyBytes = hexToUint8Array(GCM_KEY_HEX);
    const iv = hexToUint8Array(GCM_FIXED_IV_HEX);
    const encodedData = encoder.encode(textString);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]
    );

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv }, cryptoKey, encodedData
    );

    // Combine IV + Ciphertext (Standard practice for this app)
    const encryptedContentArr = new Uint8Array(encryptedContent);
    const resultBytes = new Uint8Array(iv.length + encryptedContentArr.length);
    resultBytes.set(iv);
    resultBytes.set(encryptedContentArr, iv.length);

    // Convert to Base64
    let binary = '';
    const len = resultBytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(resultBytes[i]);
    
    return window.btoa(binary);

  } catch (e) {
    return "GCM Encrypt Error: " + e.message;
  }
};

export const decryptAESGCM = async (base64CipherText) => {
  try {
    if (!base64CipherText) return "";
    if (base64CipherText.includes("U2FsdGVk")) {
        return "Error: Wrong Tab! This looks like CryptoJS data. Switch tabs.";
    }

    let cleanInput = base64CipherText.trim().replace(/^"|"$/g, '').replace(/ /g, '+');
    const keyBytes = hexToUint8Array(GCM_KEY_HEX);

    // Convert Base64 to Bytes
    let binaryString;
    try {
        const cleanBase64 = cleanInput.replace(/-/g, "+").replace(/_/g, "/");
        const paddedBase64 = cleanBase64.padEnd(cleanBase64.length + (4 - cleanBase64.length % 4) % 4, '=');
        binaryString = window.atob(paddedBase64);
    } catch { return "Invalid Base64"; }

    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    if (bytes.length < 13) return "Error: Ciphertext too short";

    // Extract IV (First 12 bytes) and Data
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
    );

    const decryptedData = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv }, cryptoKey, encryptedData
    );

    const result = new TextDecoder().decode(decryptedData);
    try { return JSON.stringify(JSON.parse(result), null, 2); } catch { return result; }

  } catch (error) {
    return "GCM Decrypt Error: " + error.message;
  }
};