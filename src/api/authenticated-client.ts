import { Bun } from "bun";

// Type guard for Bun availability
declare const Bun: any | undefined;

interface CookieClientConfig {
  defaultOptions?: RequestInit;
  securityPolicy?: {
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
  interceptors?: {
    request?: (url: string, options: RequestInit) => Promise<{ url: string; options: RequestInit }>;
    response?: (response: Response, url: string) => Promise<Response>;
  };
  monitoring?: {
    enabled?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
  };
}

interface RequestMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  cookieCount: number;
  timestamp: number;
}

let jar: any;
let metrics: RequestMetrics[] = [];
let config: CookieClientConfig = {};

if (import.meta.hot) {
  jar = import.meta.hot.data.jar ?? (typeof Bun !== 'undefined' && Bun.CookieMap ? new Bun.CookieMap() : new Map());
  metrics = import.meta.hot.data.metrics ?? [];
  config = import.meta.hot.data.config ?? {};
} else {
  jar = typeof Bun !== 'undefined' && Bun.CookieMap ? new Bun.CookieMap() : new Map();
}

export function createCookieClient(clientConfig?: CookieClientConfig) {
  config = {
    securityPolicy: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    },
    monitoring: {
      enabled: true,
      logLevel: 'info',
    },
    ...clientConfig,
  };

  const log = (level: string, message: string, data?: any) => {
    if (!config.monitoring?.enabled) return;
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[config.monitoring?.logLevel || 'info'];
    const messageLevel = levels[level as keyof typeof levels];
    
    if (messageLevel >= currentLevel) {
      if (typeof Bun !== 'undefined' && Bun.color) {
        const colors = {
          debug: 'hsl(210, 90%, 55%)',
          info: 'hsl(145, 63%, 42%)', 
          warn: 'hsl(38, 92%, 50%)',
          error: 'hsl(0, 84%, 60%)'
        };
        console.log(
          `%c[${level.toUpperCase()}] CookieClient: ${message}`,
          `color: ${Bun.color(colors[level as keyof typeof colors], 'ansi')}`,
          data || ''
        );
      } else {
        console.log(`[${level.toUpperCase()}] CookieClient: ${message}`, data || '');
      }
    }
  };

  return {
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
      const startTime = Date.now();
      const method = options.method || 'GET';
      
      try {
        log('debug', `Starting ${method} request to ${url}`);
        
        // Apply request interceptors
        let processedOptions = { ...config.defaultOptions, ...options };
        let processedUrl = url;
        
        if (config.interceptors?.request) {
          const result = await config.interceptors.request(url, processedOptions);
          processedUrl = result.url;
          processedOptions = result.options;
        }
        
        // Build cookie header
        const cookieHeader = Array.from(jar.entries())
          .filter(([name]) => !name.startsWith('__')) // Filter internal cookies
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");

        const headers = new Headers(processedOptions.headers);
        if (cookieHeader) {
          headers.set("Cookie", cookieHeader);
        }
        
        // Add security headers
        headers.set('X-Requested-With', 'CookieClient');
        
        const response = await fetch(processedUrl, { 
          ...processedOptions, 
          headers, 
          credentials: "include" 
        });

        // Process Set-Cookie headers
        const setCookies = response.headers.getSetCookie?.() || [];
        let newCookieCount = 0;
        
        for (const header of setCookies) {
          try {
            let cookie;
            if (typeof Bun !== 'undefined' && Bun.Cookie) {
              cookie = Bun.Cookie.parse(header);
            } else {
              // Simple fallback parsing
              const [nameValue] = header.split(';');
              const [name, value] = nameValue.split('=');
              cookie = { name, value };
            }
            
            // Apply security policy
            const cookieOptions = {
              ...config.securityPolicy,
              domain: cookie.domain,
              path: cookie.path,
              expires: cookie.expires,
              httpOnly: cookie.httpOnly ?? config.securityPolicy?.httpOnly,
              secure: cookie.secure ?? config.securityPolicy?.secure,
              sameSite: cookie.sameSite ?? config.securityPolicy?.sameSite,
            };
            
            if (typeof Bun !== 'undefined' && Bun.CookieMap && jar.set) {
              jar.set(cookie.name, cookie.value, cookieOptions);
            } else {
              // Map fallback
              (jar as Map<string, string>).set(cookie.name, cookie.value);
            }
            newCookieCount++;
            
            log('debug', `Stored cookie: ${cookie.name}`);
          } catch (cookieError) {
            log('warn', `Failed to parse cookie: ${header}`, cookieError);
          }
        }
        
        // Apply response interceptors
        let finalResponse = response;
        if (config.interceptors?.response) {
          finalResponse = await config.interceptors.response(response, processedUrl);
        }
        
        // Record metrics
        const duration = Date.now() - startTime;
        const metric: RequestMetrics = {
          url: processedUrl,
          method,
          duration,
          status: finalResponse.status,
          cookieCount: jar.size,
          timestamp: Date.now(),
        };
        
        metrics.push(metric);
        if (metrics.length > 100) metrics.shift(); // Keep last 100 requests
        
        log('info', `Request completed in ${duration}ms`, {
          status: finalResponse.status,
          cookies: newCookieCount,
          total: jar.size,
        });
        
        return finalResponse;
      } catch (error) {
        const duration = Date.now() - startTime;
        log('error', `Request failed after ${duration}ms`, error);
        throw new Error(`Cookie client fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

    getCookie(name: string): string | null {
      return jar.get(name);
    },

    hasCookie(name: string): boolean {
      return jar.has(name);
    },

    deleteCookie(name: string, options?: Bun.CookieInit) {
      if (options) {
        jar.delete(name, options);
      } else {
        jar.delete(name);
      }
    },

    getSetCookieHeaders(): string[] {
      const headers: string[] = [];
      jar.forEach((value: string, name: string) => {
        if (typeof Bun !== 'undefined' && Bun.Cookie) {
          const cookie = new Bun.Cookie(name, value);
          headers.push(cookie.toString());
        } else {
          headers.push(`${name}=${value}`);
        }
      });
      return headers;
    },

    toHeaderString(): string {
      return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    },

    get size(): number {
      return jar.size;
    },

    getMetrics(): RequestMetrics[] {
      return [...metrics];
    },
    
    getAverageResponseTime(): number {
      if (metrics.length === 0) return 0;
      const total = metrics.reduce((sum, m) => sum + m.duration, 0);
      return Math.round(total / metrics.length);
    },
    
    getSuccessRate(): number {
      if (metrics.length === 0) return 0;
      const successful = metrics.filter(m => m.status < 400).length;
      return Math.round((successful / metrics.length) * 100);
    },
    
    clearMetrics(): void {
      metrics = [];
    },
    
    updateConfig(newConfig: Partial<CookieClientConfig>): void {
      config = { ...config, ...newConfig };
    },
    
    getConfig(): CookieClientConfig {
      return { ...config };
    },
    
    exportCookies(): string {
      return JSON.stringify(Object.fromEntries(jar.entries()));
    },
    
    importCookies(cookieData: string): void {
      try {
        const cookies = JSON.parse(cookieData);
        for (const [name, value] of Object.entries(cookies)) {
          jar.set(name, value as string, config.securityPolicy);
        }
        log('info', `Imported ${Object.keys(cookies).length} cookies`);
      } catch (error) {
        log('error', 'Failed to import cookies', error);
        throw new Error('Invalid cookie data format');
      }
    },
    
    debug(label: string = "Cookie Client"): void {
      if (typeof Bun !== 'undefined' && Bun.color) {
        console.log(
          `%c${label} (${jar.size} cookies, ${metrics.length} metrics):`,
          `color: ${Bun.color("hsl(28, 80%, 52%)", "ansi")}; font-weight: bold` 
        );

        for (const [name, value] of jar.entries()) {
          const truncated = value.length > 20 ? value.slice(0, 20) + "..." : value;
          const isSecure = name.startsWith('_secure') ? '🔒' : '';
          console.log(
            `  %c${isSecure}${name}%c = %c${truncated}`,
            `color: ${Bun.color("hsl(210, 90%, 55%)", "ansi")}`,
            "color: reset",
            `color: ${Bun.color("hsl(145, 63%, 42%)", "ansi")}` 
          );
        }
        
        if (metrics.length > 0) {
          console.log(
            `  %c📊 Avg: ${this.getAverageResponseTime()}ms, Success: ${this.getSuccessRate()}%`,
            `color: ${Bun.color("hsl(25, 85%, 55%)", "ansi")}`
          );
        }
      } else {
        console.log(`${label} (${jar.size} cookies, ${metrics.length} metrics):`);
        for (const [name, value] of jar.entries()) {
          console.log(`  ${name} = ${value}`);
        }
      }
    },
  };
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    import.meta.hot.data.jar = jar;
    import.meta.hot.data.metrics = metrics;
    import.meta.hot.data.config = config;
  });
}
