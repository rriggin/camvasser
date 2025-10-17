import bcrypt from 'bcryptjs';

const storedHash = '$2b$10$0BWT0S9ITF1JBPQ8A8tmru3e9jm6o/9SKZX7X/qYBC5bA1A40ofkG';
const password = 'm@ch1nes';

const isValid = await bcrypt.compare(password, storedHash);
console.log('Password valid:', isValid);
