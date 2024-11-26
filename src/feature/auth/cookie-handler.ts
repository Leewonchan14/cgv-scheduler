export type ICookieStore = {
  get: (key: string) => string | undefined | null;
  set: (
    key: string,
    value: string,
    option: { httpOnly: boolean; expires: Date },
  ) => void;
};

export class CookieTokenHandler {
  private TOKEN_KEY = 'token' as const;

  // 2시간
  private readonly TOKEN_EXPIRE = 1000 * 60 * 60 * 2;
  private TOKEN_COOKIE_OPTION = {
    httpOnly: true,
    expires: new Date(Date.now() + this.TOKEN_EXPIRE),
  };

  constructor(private cookie: ICookieStore) {}

  set(token: string) {
    this.cookie.set(this.TOKEN_KEY, token, this.TOKEN_COOKIE_OPTION);
  }

  get() {
    return this.cookie.get(this.TOKEN_KEY);
  }

  clear() {
    this.cookie.set(this.TOKEN_KEY, 'null', {
      httpOnly: true,
      expires: new Date(0),
    });
  }
}
