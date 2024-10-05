import bcrypt from 'bcryptjs';

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
