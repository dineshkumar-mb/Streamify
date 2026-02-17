import CryptoJS from "crypto-js";

// In a real app, this should be a derived secret or shared key per channel
// For this demo, we'll use a consistent secret key
const SECRET_KEY = "streamify-encryption-key-123";

export const encryptMessage = (text) => {
    if (!text) return "";
    try {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
};

export const decryptMessage = (ciphertext) => {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext || "";

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        // Try to convert to UTF-8
        try {
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            // If we have a non-empty decrypted string, return it
            if (decrypted) return decrypted;
        } catch (e) {
            // If UTF-8 conversion fails, it's definitely not our message
            return ciphertext;
        }

        return ciphertext;
    } catch (error) {
        return ciphertext;
    }
};
