import { promisify } from "node:util";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCRYPT_PARAMS = {
  N: 16_384,
  p: 1,
  r: 8,
};

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
    SCRYPT_PARAMS,
  )) as Buffer;

  return [
    "scrypt",
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt,
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, cost, blockSize, parallelization, salt, hash] =
    storedHash.split("$");

  if (!algorithm || !cost || !blockSize || !parallelization || !salt || !hash) {
    return false;
  }

  if (algorithm !== "scrypt") {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH, {
    N: Number(cost),
    p: Number(parallelization),
    r: Number(blockSize),
  })) as Buffer;
  const storedBuffer = Buffer.from(hash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}
