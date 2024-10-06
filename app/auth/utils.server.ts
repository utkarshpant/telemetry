import bcrypt from 'bcryptjs';
import { createSessionStorage } from '@remix-run/node';
import { PrismaClient, Session } from '@prisma/client';

/**
 *
 * @param passwordToHash string: The plaintext password to hash
 * @returns Promise<string>: A promise that resolves to the hashed password
 */
export async function hashPassword(passwordToHash: string): Promise<string> {
	return await bcrypt.hash(passwordToHash, 10);
}

/**
 * Compares a plaintext password with a hashed password to determine if they match.
 *
 * @param plaintextPassword - The plaintext password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export async function comparePasswords(
	plaintextPassword: string,
	hashedPassword: string
): Promise<boolean> {
	return await bcrypt.compare(plaintextPassword, hashedPassword);
}

const prisma = new PrismaClient();

export const { getSession, commitSession, destroySession } = createSessionStorage<
	Pick<Session, 'ipAddress' | 'userId' | 'userAgent'>
>({
	cookie: {
		name: '__session',
		secrets: [process.env.TELEMETRY_SECRET as string],
		isSigned: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
	async createData(data, expires) {
		const session: Session = await prisma.session.create({
			data: {
				userId: data.userId as number,
				expiresAt: expires,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
			},
		});
		return session.id;
	},
	async readData(id) {
		const session = await prisma.session.findUnique({
			where: {
				id,
			},
			include: {
				user: true,
			},
		});
		if (!session) return null;
		return {
			userId: session.userId,
			sessionId: session.id,
			user: session.user,
		};
	},
	async updateData(id, data, expires) {
		await prisma.session.update({
			where: {
				id,
			},
			data: {
				expiresAt: expires,
			},
		});
	},
	async deleteData(id) {
		await prisma.session.update({
			where: {
				id,
			},
			data: {
				status: 'INACTIVE',
			},
		});
	},
});
