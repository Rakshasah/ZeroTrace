export const generateKeyPair = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
    );
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const base64ToBuffer = (base64: string): Uint8Array => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return bufferToBase64(exported);
};

export const importPublicKey = async (pem: string): Promise<CryptoKey> => {
    const binaryDer = base64ToBuffer(pem);
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer as any, // Cast to any to bypass strict BufferSource type check
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        []
    );
};

export const deriveSharedSecret = async (privateKey: CryptoKey, publicKey: CryptoKey) => {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
};

export const encryptMessage = async (secret: CryptoKey, text: string) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        secret,
        encoded
    );

    return {
        content: bufferToBase64(ciphertext),
        iv: bufferToBase64(iv.buffer as ArrayBuffer)
    };
};

export const decryptMessage = async (secret: CryptoKey, content: string, iv: string) => {
    try {
        const binaryIv = base64ToBuffer(iv);
        const binaryContent = base64ToBuffer(content);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: binaryIv as any,
            },
            secret,
            binaryContent as any
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption failed:", e);
        return null;
    }
};
