import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { scrypt, timingSafeEqual, randomBytes } from "crypto";
import { promisify } from "util";
import logger from "@/lib/logger";

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt (memory-hard, NIST-recommended).
 * Format: `<salt>:<hash>` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored hash produced by {@link hashPassword}.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  return timingSafeEqual(derivedKey, storedBuf);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        totp: { label: "Código MFA (se habilitado)", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          logger.warn({ email: credentials.email }, "Login attempt: user not found");
          return null;
        }

        const passwordValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!passwordValid) {
          logger.warn({ email: credentials.email }, "Login attempt: invalid password");
          return null;
        }

        // MFA check — when enabled, require a valid TOTP code
        if (user.mfaEnabled) {
          if (!credentials.totp) {
            logger.warn({ email: credentials.email }, "Login attempt: MFA code missing");
            return null;
          }
          // TODO: validate TOTP with speakeasy/otplib in production
          // For the scaffold, we accept any 6-digit code when mfaSecret is present
          if (!/^\d{6}$/.test(credentials.totp)) {
            logger.warn({ email: credentials.email }, "Login attempt: invalid MFA code format");
            return null;
          }
        }

        logger.info({ userId: user.id }, "User authenticated");
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
