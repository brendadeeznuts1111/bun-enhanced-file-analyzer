import { Bun } from "bun";

const jar = new Bun.CookieMap();

export function createCookieClient() {
  return {
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
      const cookieHeader = Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");

      const headers = new Headers(options.headers);
      if (cookieHeader) {
        headers.set("Cookie", cookieHeader);
      }

      const response = await fetch(url, { ...options, headers, credentials: "include" });

      const setCookies = response.headers.getSetCookie?.() || [];
      for (const header of setCookies) {
        const cookie = Bun.Cookie.parse(header);
        jar.set(cookie.name, cookie.value, {
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
        });
      }

      return response;
    },

    getCookies() {
      return Object.fromEntries(jar.entries());
    },

    clearCookies() {
      jar.clear?.();
    },

    setCookie(name: string, value: string, options?: Bun.CookieInit) {
      jar.set(name, value, options);
    },
  };
}
