import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCRYPT_PARAMS = {
  N: 16_384,
  p: 1,
  r: 8,
};

function deriveKey(password: string, salt: string, options = SCRYPT_PARAMS) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function parsePositiveSafeInteger(value: string) {
  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await deriveKey(password, salt);

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

  const parsedCost = parsePositiveSafeInteger(cost);
  const parsedBlockSize = parsePositiveSafeInteger(blockSize);
  const parsedParallelization = parsePositiveSafeInteger(parallelization);

  if (!parsedCost || !parsedBlockSize || !parsedParallelization) {
    return false;
  }

  let derivedKey: Buffer;

  try {
    derivedKey = await deriveKey(password, salt, {
      N: parsedCost,
      p: parsedParallelization,
      r: parsedBlockSize,
    });
  } catch {
    return false;
  }

  const storedBuffer = Buffer.from(hash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}
