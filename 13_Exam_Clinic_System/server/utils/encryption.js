import dotenv from 'dotenv/config'
import bcrypt from "bcrypt"; // password hashing tool
export function bcryptPassword(password) { // Bbcrypt has an automatic assigned salt. slow by design & protects more against brute force
  return bcrypt.hash(password, 12);
}

import crypto from 'crypto'; // general cryptography toolbox. Fast hash. Keyed Hashedes. ENcryption. 

if (!process.env.CPR_SECRET) {
  throw new Error("CPR_SECRET is missing - required for encryption");
}
// This is the key which unlocks the data which is encrypted 
const KEY = crypto.scryptSync(process.env.CPR_SECRET, 'salt', 32); // 32 bytes or more:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

export function encryptCPR(cpr) { 
  // ensure that encryptions of the same value is not the same any time you encrypt. 
  const iv = crypto.randomBytes(12);
  //locked an algorithm with your KEY and the random bytes iv
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  // encrpyt data with cipher 
  const encrypted = Buffer.concat([
    cipher.update(cpr, 'utf8'),
    cipher.final()
  ]);
  // failsafe for data, in case of unauthorized changes in the data.
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptCPR(encryptedData) {
  const data = Buffer.from(encryptedData, 'base64');

  const iv = data.subarray(0, 12); // 12 bytes
  const tag = data.subarray(12, 28); // 16 bytes
  const text = data.subarray(28); // the rest of the locked text

  // creates a cipher based on the algorithm, KEY, iv
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag); // tag is used to check whether the data has been modified, if so it will fail.

  //decypted 
  const decrypted = Buffer.concat([
    decipher.update(text),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

