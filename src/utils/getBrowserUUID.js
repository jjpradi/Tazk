// getBrowserUUID.js
 
function detectBrowser() {

  // Modern API first

  if (navigator.userAgentData?.brands) {

   const brands = navigator.userAgentData.brands.map(b => b.brand).join(" ").toLowerCase();

  if (brands.includes("edge") || brands.includes("microsoft edge")) return "Edge";
  if (brands.includes("chrome") && !brands.includes("edge")) return "Chrome";
  if (brands.includes("safari") && !brands.includes("chrome")) return "Safari";
  if (brands.includes("firefox")) return "Firefox";

    return "Other";

  }
 
  // Fallback to userAgent string

  const ua = navigator.userAgent || "";

  if (/\bEdg\b|\bEdg\//i.test(ua)) return "Edge"; // Edge

  if (/\bFirefox\b/i.test(ua)) return "Firefox";

  if (/\bChrome\b/i.test(ua) && !/\bEdg\b/i.test(ua)) return "Chrome";

  if (/\bSafari\b/i.test(ua) && !/\bChrome\b/i.test(ua)) return "Safari";

  return "Other";

}
 
function genUUID() {

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {

    return crypto.randomUUID();

  }

  // fallback random UUID

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {

    const r = (Math.random() * 16) | 0;

    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);

  });

}
 
/**

* Returns a Promise that resolves with a persistent unique ID for this browser

* {

*   id: string,

*   browser: string,

*   createdAt: string

* }

*/

export function getBrowserUUID(namespace = "myapp") {

  return new Promise((resolve) => {

    const browser = detectBrowser();

    const key = `${namespace}_browser_id`;
 
    try {

      const existing = localStorage.getItem(key);

      if (existing) {

        const parsed = JSON.parse(existing);

        resolve({ ...parsed, browser });

        return;

      }
 
      const id = genUUID();

      const createdAt = new Date().toISOString();

      const payload = { id, createdAt ,browser};

  localStorage.setItem(key, JSON.stringify(payload));

      resolve({ id, createdAt, browser });

    } catch (err) {

      // Fallback for private mode or restricted environments

      const id = genUUID();

      const createdAt = new Date().toISOString();

      resolve({ id, createdAt, browser, error: err.message });

    }

  });

}

 