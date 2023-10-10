import * as crypto from "crypto";

function hashString(input: string): string {
  const sha256Hash = crypto.createHash("sha256");
  sha256Hash.update(input);
  return sha256Hash.digest("hex");
}

const inputString: string = "Hello, world!";
const hashedString: string = hashString(inputString);

console.log("Input String:", inputString);
console.log("Hashed String (SHA-256):", hashedString);
