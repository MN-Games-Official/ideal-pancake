import crypto from 'crypto';

export function encryptKey(key: string): string {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), // 32 chars
    Buffer.alloc(16, 0) // Static IV for simplicity in this MVP, otherwise should be random
  );
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptKey(encrypted: string): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'),
    Buffer.alloc(16, 0)
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
