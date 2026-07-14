import CryptoJS from 'crypto-js';
const VITE_CHAT_ENCRYPTION_KEY = import.meta.env.VITE_CHAT_ENCRYPTION_KEY;

export const Encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, VITE_CHAT_ENCRYPTION_KEY).toString()
}

export const Decrypt = (text) => {
  return CryptoJS.AES.decrypt(text, VITE_CHAT_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
}
