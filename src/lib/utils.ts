import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
