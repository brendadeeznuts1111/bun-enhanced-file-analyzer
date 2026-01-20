import { describe, it, expect, beforeEach } from "bun:test";

describe("Bun Native Cookie Integration", () => {
  let server: ReturnType<typeof Bun.serve>;

  beforeEach(() => {
    server = Bun.serve({
      routes: {
        "/set-cookie": (req) => { req.cookies.set("test", "value", { httpOnly: true }); return new Response("Cookie set"); },
        "/get-cookie": (req) => { const value = req.cookies.get("test"); return Response.json({ value }); },
      },
      port: 0,
    });
  });

  it("sets and retrieves cookies with bun.serve", async () => {
    const setResponse = await fetch(`${server.url}/set-cookie`);
    expect(setResponse.status).toBe(200);

    const setCookies = setResponse.headers.getSetCookie?.() || [];
    expect(setCookies.length).toBeGreaterThan(0);

    const jar = new Bun.CookieMap(setCookies);
    expect(jar.get("test")).toBe("value");

    const cookieHeader = Array.from(jar.entries()).map(([n, v]) => `${n}=${v}`).join("; ");
    const getResponse = await fetch(`${server.url}/get-cookie`, { headers: { Cookie: cookieHeader } });
    const data = await getResponse.json();
    expect(data.value).toBe("value");
  });
});
