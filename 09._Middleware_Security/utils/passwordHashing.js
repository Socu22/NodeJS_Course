import bcrypt from 'bcrypt';

const password = 'hunter123';
const passwordComparison = 'hunter123';
const saltRounds = 14;

// /auth/signup  /auth/register
const hashedPassword = await bcrypt.hash(password, saltRounds);

console.log(hashedPassword);

// /auth/login
const passwordIsSame = await bcrypt.compare(passwordComparison, hashedPassword);

console.log(passwordIsSame);