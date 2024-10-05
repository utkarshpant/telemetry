import { json, type ActionFunction, type MetaFunction } from '@remix-run/node';
import { useRef, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePasswords } from '~/auth/utils.server';
import { useActionData, useLocation, useFetcher } from '@remix-run/react';
import PasswordInput from '~/components/PasswordInput';

const prisma = new PrismaClient();

type SignUpIntent = 'sign_up' | 'sign_in';

export const meta: MetaFunction = () => {
	return [{ title: 'Telemetry' }, { name: 'description', content: 'This is Telemetry.' }];
};

export const action: ActionFunction = async ({ request }) => {
	const url = new URL(request.url);
	const urlParams = new URLSearchParams(url.search);
	const intent = urlParams.get('intent') as SignUpIntent;
	if (intent === 'sign_up') {
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
					first_name: firstName,
					last_name: lastName,
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
					message: `${newUser.first_name}, you've signed up successfully!`,
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
	} else if (intent === 'sign_in') {
		// read form data, check if user exists, check if password matches, return user data
		const formData = await request.formData();
		const emailOrUsername = formData.get('email_or_username') as string;
		const password = formData.get('password') as string;
		const user = await prisma.user
			.findFirst({
				where: {
					OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
				},
				include: {
					credentials: true,
				},
			})
			.catch((error) => {
				return json(
					{
						message: 'An error occurred while signing you in. Please try again!',
						error,
					},
					500
				);
			});

		if (!user) {
			return json(
				{
					message: 'User not found. Please sign up first.',
				},
				404
			);
		} else {
			const passwordMatch = await comparePasswords(password, user.credentials.passwordHash);
			if (passwordMatch) {
				return json(
					{
						user: {
							first_name: user.first_name,
							lastName: user.last_name,
							username: user.username,
							email: user.email,
							bio: user.bio,
							user_id: user.user_id,
						},
						message: `${user.first_name}, you've signed in successfully!`,
					},
					200
				);
			} else {
				return json(
					{
						message: 'Incorrect password. Please try again.',
					},
					403
				);
			}
		}
	}
};

function AuthForm() {
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);
	const [validationMessage, setValidationMessage] = useState('');
	const authFetcher = useFetcher();
	const actionData = useActionData();
	const urlParams = useLocation();

	const isSignUp = urlParams.hash === '#signup';

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

	if (isSignUp) {
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
				<div className='w-full'>
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
				</div>
				{/* Row 3 */}
				<div className='w-full'>
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
				{/* Row 4 */}
				<div className='w-full flex flex-row gap-2'>
					<label
						htmlFor='password'
						className='w-auto flex flex-col text-xs'
					>
						<span>
							Password<span className='font-semibold text-red-600'>*</span>
						</span>
						<input
							ref={passwordRef}
							type='password'
							name='password'
							className='p-2 rounded text-base focus:bg-white focus:text-black'
							aria-required='true'
							onChange={matchPasswords}
							required
						></input>
					</label>
					<label
						htmlFor='re-enter-password'
						className='w-auto flex flex-col text-xs'
					>
						<span>
							Re-enter Password
							<span className='font-semibold text-red-600'>*</span>
						</span>
						<input
							ref={confirmPasswordRef}
							type='password'
							name='re-enter-password'
							className='p-2 text-base focus:bg-white focus:text-black'
							aria-required='true'
							onChange={matchPasswords}
							required
						></input>
						{validationMessage ? (
							<p className='text-white mt-2 text-xs'>{validationMessage}</p>
						) : null}
					</label>
				</div>
				{/* Row 5 */}
				<div className='w-full flex flex-col'>
					{actionData?.user ? (
						<p className='text-white text-xs'>
							{actionData.user.first_name}, you&apos;re good to go.
						</p>
					) : null}
					<button
						type='submit'
						className='p-2 bg-cyan-900 w-full mt-4 text-white rounded'
					>
						Sign up.
					</button>
					<span className='text-xs font-white'>
						Already a member?{' '}
						<a
							href='/'
							className='underline'
						>
							Sign in.
						</a>
					</span>
				</div>
			</authFetcher.Form>
		);
	} else {
		return (
			<authFetcher.Form
				method='POST'
				className='flex flex-col w-max rounded gap-2 p-2'
				action='?index&intent=sign_in'
			>
				{/* Row 1 */}
				<div className='w-full flex flex-row gap-2'>
					<label
						htmlFor='email_or_username'
						className='w-full flex flex-col text-xs'
					>
						<span>
							Email or Username<span className='text-red-600 font-semibold'>*</span>
						</span>
						<input
							type='text'
							name='email_or_username'
							className='p-2 rounded text-base focus:bg-white focus:text-black'
							required
							aria-required='true'
						></input>
					</label>
				</div>

				{/* Row 2 */}
				<div className='w-full flex flex-col gap-2'>
					<label
						htmlFor='password'
						className='w-auto flex flex-col text-xs'
					>
						<span>
							Password<span className='font-semibold text-red-600'>*</span>
						</span>
						<PasswordInput
							ref={passwordRef}
							type='password'
							name='password'
							className='p-2 rounded text-base focus:bg-white focus:text-black'
							aria-required='true'
							onChange={matchPasswords}
							required
						></PasswordInput>
					</label>
					<button
						type='submit'
						className='p-2 bg-cyan-900 w-auto mt-4 text-white rounded'
					>
						Sign in.
					</button>
					<span className='text-xs font-white'>
						Not a member yet?{' '}
						<a
							href='#signup'
							className='underline'
						>
							Sign up.
						</a>
					</span>
				</div>
			</authFetcher.Form>
		);
	}
}

function Index() {
	return (
		<div className='p-12'>
			<h1>Telemetry</h1>
			<div className='w-full flex justify-center items-center'>
				<AuthForm />
			</div>
		</div>
	);
}

export default Index;
