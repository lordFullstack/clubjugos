import { randomInt } from "node:crypto";

// Alfabeto sin 0/O/1/I/L para evitar confusiones si alguien lee el token a mano.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const TOKEN_LENGTH = 10;

/**
 * Genera un token de un solo uso, aleatorio y difícil de adivinar
 * (31^10 ≈ 8.2 × 10^14 combinaciones posibles). Nunca usar IDs incrementales.
 */
export function generateSecureToken(): string {
  let token = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += ALPHABET[randomInt(ALPHABET.length)];
  }
  return token;
}
