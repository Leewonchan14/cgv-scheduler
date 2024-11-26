import bcrypt from 'bcrypt';

class PwHandler {
  encrypt(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  compare(password: string, encryptedPassword?: string) {
    return bcrypt.compareSync(password, encryptedPassword ?? '');
  }
}

export const pwHandler = new PwHandler();
