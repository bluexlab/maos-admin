import { eq } from "drizzle-orm";
import { db } from "~/drizzle";
import { settings } from "~/drizzle/schema";
import { env } from "~/env";

export async function encryptApiToken(apiToken: string): Promise<string> {
  const keyString = env.NEXTAUTH_SECRET;
  const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(apiToken),
  );

  const encryptedArray = new Uint8Array(iv.byteLength + encrypted.byteLength);
  encryptedArray.set(iv, 0);
  encryptedArray.set(new Uint8Array(encrypted), iv.byteLength);

  return Buffer.from(encryptedArray).toString("hex");
}

export async function decryptApiToken(encryptedToken: string): Promise<string> {
  const keyString = env.NEXTAUTH_SECRET;
  const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, ["decrypt"]);

  const encryptedBuffer = Buffer.from(encryptedToken, "hex");
  const iv = encryptedBuffer.slice(0, 12);
  const data = encryptedBuffer.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

  return new TextDecoder().decode(decrypted);
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

let apiTokenCache: CacheEntry | null = null;

export async function getApiToken(): Promise<string | null> {
  if (!apiTokenCache || apiTokenCache.expiresAt < Date.now()) {
    await fetchApiToken();
  }
  return apiTokenCache?.value ?? null;
}

async function fetchApiToken() {
  const token = await db.query.settings.findFirst({
    where: eq(settings.key, "api-token"),
  });

  if (token?.value) {
    const decrypted = await decryptApiToken(token.value);
    apiTokenCache = {
      value: decrypted,
      expiresAt: Date.now() + 60000,
    };
  }
}
