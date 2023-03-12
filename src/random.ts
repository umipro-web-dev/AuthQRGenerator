import crypto from "crypto";

export function randomString(len: number): string{
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomArr = new Uint32Array(new Uint8Array(crypto.randomBytes(len * 4)).buffer);
    return [...randomArr].map(n => chars.charAt(n % chars.length)).join('');
  }