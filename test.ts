import crypto from "crypto";

const str: string = "ein";

const iv = Buffer.from("dAnnmNXjCJr95Ejt");

let hash = crypto.createHash("sha224");

hash = hash.update("YBPM2sFrbgBkXLh4K3usXbzKyR5hh9di");

const key = hash.digest().slice(0, 16);

const encoder = crypto.createCipheriv("aes-128-cbc", key, iv);
const encoded = encoder.update(str);
const encoded_con = Buffer.concat([encoded, encoder.final()]);
const encoded_str = encoded_con.toString("hex");

console.log(encoded_str);