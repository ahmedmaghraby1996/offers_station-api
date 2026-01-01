import { createCipheriv, createDecipheriv } from 'crypto';

export function encrypt(text: string, key: string): string {
  // Key is expected to be a hex string of 32 characters (16 bytes) for AES-128
  const keyBuffer = Buffer.from(key, 'hex');
  // AES-128-ECB is commonly used for this type of payment gateway integration
  const cipher = createCipheriv('aes-128-ecb', keyBuffer, null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedText: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const decipher = createDecipheriv('aes-128-ecb', keyBuffer, null);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
