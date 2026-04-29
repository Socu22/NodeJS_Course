import dotenv from 'dotenv/config'
import bcrypt from "bcrypt"; // password hashing tool
export function bcryptPassword(password) { // Bbcrypt has an automatic assigned salt. slow by design & protects more against brute force
  return bcrypt.hash(password, 12);
}

import crypto from 'crypto'; // general cryptography toolbox. Fast hash. Keyed Hashedes. ENcryption. 

if (!process.env.CPR_SECRET) {
  throw new Error("CPR_SECRET is missing - required for encryption");
}
const KEY = crypto.scryptSync(process.env.CPR_SECRET, 'salt', 32); // 32 bytes or more:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

export function encryptCPR(cpr) { // crypto has a more 
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(cpr, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptCPR(encryptedData) {
  const data = Buffer.from(encryptedData, 'base64');

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const text = data.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(text),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

