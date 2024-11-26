export type ICookieStore = {
  get: (key: string) => string | undefined | null;
  set: (
    key: string,
    value: string,
    option: { httpOnly: boolean; expires: Date; secure: boolean },
  ) => void;
};

export class CookieTokenHandler {
  static TOKEN_KEY = 'token' as const;

  // 2시간
  private readonly TOKEN_EXPIRE = 1000 * 60 * 60 * 2;
  private TOKEN_COOKIE_OPTION = {
    httpOnly: true,
    expires: new Date(Date.now() + this.TOKEN_EXPIRE),
    secure: true,
  };

  constructor(private cookie: ICookieStore) {}

  set(token: string) {
    this.cookie.set(
      CookieTokenHandler.TOKEN_KEY,
      token,
      this.TOKEN_COOKIE_OPTION,
    );
  }

  get() {
    return this.cookie.get(CookieTokenHandler.TOKEN_KEY);
  }

  clear() {
    this.cookie.set(CookieTokenHandler.TOKEN_KEY, 'null', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
    });
  }
}
