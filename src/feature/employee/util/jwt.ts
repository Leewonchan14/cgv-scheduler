import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_KEY = 'token' as const;

const SALT = bcrypt.genSaltSync(10);

export const 암호화 = (password: string) => {
  return bcrypt.hashSync(password, SALT);
};

const create = async (payload: { id: number }) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(new TextEncoder().encode(JWT_SECRET));
};

const decode = async (token: string) => {
  try {
    const decoded = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );
    return decoded.payload as { id: number };
  } catch (_error) {
    return null;
  }
};

const set = (token: string) => {
  const cookie = cookies();
  cookie.set(TOKEN_KEY, token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
  });
};

const get = () => {
  const cookie = cookies();
  const tokenObj = cookie.get(TOKEN_KEY);
  return tokenObj?.value;
};

export const jwt = {
  create,
  decode,
  set,
  get,
  JWT_SECRET,
};
