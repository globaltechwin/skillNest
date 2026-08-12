// Lightweight JWT verification for Edge/proxy runtime
// No Node.js imports, no Next.js server imports

const JWT_SECRET = process.env.AUTH_SECRET || "skillnest-dev-secret-change-in-production";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  firstName: string | null;
  lastName: string | null;
};

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function verifyJwtProxy(token: string): Promise<SessionPayload | null> {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${header}.${body}`);
    const sigBytes = Uint8Array.from(atob(base64urlDecode(signature)), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);

    if (!valid) return null;

    const payload = JSON.parse(base64urlDecode(body));
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  } catch {
    return null;
  }
}
