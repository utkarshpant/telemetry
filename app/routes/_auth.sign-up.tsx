import { type ActionFunction, json } from '@remix-run/node';
import { useFetcher, type MetaFunction } from '@remix-run/react';
import { useRef, useState } from 'react';
import PasswordInput from '~/components/PasswordInput';
import { prisma } from '../../prisma/db.server';
import { hashPassword } from '~/auth/utils.server';
import { type User } from '@prisma/client';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Telemetry | Sign up' },
		{ name: 'description', content: 'Sign up for a Telemetry account.' },
	];
};

type ActionData = {
	message: string;
} | {
	message: string;
	user: User;
} | {
	message: string;
	error: Error;
}

export const action: ActionFunction = async ({ request }) => {
	// read form data, create a user using prisma and return confirmation that user was created.
	const formData = await request.formData();
	const firstName = formData.get('first_name') as string;
	const lastName = formData.get('last_name') as string;
	const username = formData.get('username') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	// check if any user with this email or username exists
	const user = await prisma.user
		.findFirst({
			where: {
				OR: [{ email: email }, { username: username }],
			},
		})
		.catch((error) => {
			return json(
				{
					message: 'An error occurred while signing you up. Please try again!',
					error,
				},
				500
			);
		});
	if (!user) {
		// create new user, hash password and store in database
		const newUser = await prisma.user.create({
			data: {
				firstName: firstName,
				lastName: lastName,
				username: username,
				email: email,
				credentials: {
					create: {
						passwordHash: await hashPassword(password),
					},
				},
			},
		});

		return json(
			{
				user: newUser,
				message: `${newUser.firstName}, you've signed up successfully!`,
			},
			200
		);
	} else {
		return json(
			{
				message: 'This user already exists! Try signing in instead.',
			},
			403
		);
	}
};

export default function SignUp() {
	const authFetcher = useFetcher();
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);
	const [validationMessage, setValidationMessage] = useState('');
	const actionData = authFetcher.data as ActionData;

	const matchPasswords = () => {
		if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
			const message = 'Passwords do not match.';
			confirmPasswordRef.current?.setCustomValidity(message);
			setValidationMessage(message);
		} else {
			confirmPasswordRef.current?.setCustomValidity('');
			setValidationMessage('');
		}
	};

	return (
		<authFetcher.Form
			method='POST'
			className='flex flex-col w-max rounded gap-2 p-2'
			action='?index&intent=sign_up'
		>
			{/* Row 1 */}
			<div className='w-full flex flex-row gap-2'>
				<label
					htmlFor='first_name'
					className='w-auto flex flex-col text-xs'
				>
					<span>
						First Name<span className='text-red-600 font-semibold'>*</span>
					</span>
					<input
						type='text'
						name='first_name'
						className='p-2 rounded text-base focus:bg-white focus:text-black'
						required
						aria-required='true'
					></input>
				</label>
				<label
					htmlFor='last_name'
					className='w-auto flex flex-col text-xs'
				>
					Last Name
					<input
						type='text'
						name='last_name'
						className='p-2 rounded text-base focus:bg-white focus:text-black'
					></input>
				</label>
			</div>
			{/* Row 2 */}
			<div className='w-full flex flex-row gap-2'>
				<label
					htmlFor='username'
					className='w-auto flex flex-col text-xs'
				>
					<span>
						Username<span className='text-red-600 font-semibold'>*</span>
					</span>
					<input
						type='text'
						name='username'
						className='p-2 rounded text-base focus:bg-white focus:text-black'
						aria-required='true'
						required
					></input>
				</label>
				<label
					htmlFor='email'
					className='w-auto flex flex-col text-xs'
				>
					Email
					<input
						type='email'
						name='email'
						className='p-2 rounded text-base focus:bg-white focus:text-black'
					></input>
				</label>
			</div>
			{/* Row 3
			<div className='w-full'>
			</div> */}
			{/* Row 4 */}
			<div className='w-full flex flex-col gap-2'>
				<label
					htmlFor='password'
					className='w-full flex flex-col text-xs'
				>
					<span>
						Password<span className='font-semibold text-red-600'>*</span>
					</span>
					<PasswordInput
						ref={passwordRef}
						name='password'
						className='p-2 rounded w-full text-base focus:bg-white focus:text-black'
						aria-required='true'
						onChange={matchPasswords}
						required
					></PasswordInput>
				</label>
				<label
					htmlFor='re-enter-password'
					className='w-full flex flex-col text-xs'
				>
					<span>
						Re-enter Password
						<span className='font-semibold text-red-600'>*</span>
					</span>
					<PasswordInput
						ref={confirmPasswordRef}
						name='re-enter-password'
						className='p-2 w-full text-base focus:bg-white focus:text-black'
						aria-required='true'
						onChange={matchPasswords}
						required
					></PasswordInput>
					{validationMessage ? (
						<p className='text-white mt-2 text-xs'>{validationMessage}</p>
					) : null}
				</label>
			</div>
			{/* Row 5 */}
			<div className='w-full flex flex-col'>
				{actionData && 'user' in actionData ? (
					<p className='text-white text-xs'>
						{actionData && 'user' in actionData ? (
							<>{actionData.user.firstName}, you&apos;re good to go.</>
						) : null}
					</p>
				) : null}
				<button
					type='submit'
					className='p-2 bg-cyan-950 w-full mt-4 text-white rounded'
				>
					Sign up.
				</button>
				<span className='text-xs font-white mt-2'>
					Already a member?{' '}
					<a
						href='/sign-in'
						className='underline'
					>
						Sign in.
					</a>
				</span>
			</div>
		</authFetcher.Form>
	);
}
