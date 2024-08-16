import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomId(len = 20): string {
  const isNode = process?.versions?.node != null;

  if (isNode) {
    // hack to get crypto.getRandomValues working in node.
    // eslint-disable-next-line
    const arr = require("crypto").randomBytes(len) as Buffer;
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
  } else {
    const arr = new Uint8Array(len / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
  }
}

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
