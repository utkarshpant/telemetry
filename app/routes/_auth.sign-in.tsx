import { json, useFetcher } from '@remix-run/react';
import { type MetaFunction, type ActionFunctionArgs } from '@remix-run/node';
import { prisma } from '../../prisma/db.server';
import { comparePasswords } from '~/auth/utils.server';
import PasswordInput from '~/components/PasswordInput';
import { useRef } from 'react';
import { User } from '@prisma/client';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Telemetry | Sign in' },
		{ name: 'description', content: 'Sign into your Telemetry account.' },
	];
};

type ActionData =
	| {
        message: string;
	}
	| {
        message: string;
        user: User;
	}
	| {
        message: string;
        error: Error;
	};

/**
 * Handles the sign-in action for the authentication route.
 *
 * The function performs the following steps:
 * 1. Extracts `email_or_username` and `password` from the form data.
 * 2. Searches for a user in the database with the provided email or username.
 * 3. If a user is found, it verifies the provided password against the stored password hash.
 * 4. If the password matches, returns a success response with user details.
 * 5. If the password does not match, returns an error response indicating incorrect password.
 * 6. If no user is found, returns an error response indicating the user is not found.
 * 7. If any error occurs during the process, returns a generic error response.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
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
				message: 'Incorrect username or password. Please try again.',
			},
			404
		);
	} else {
		if (user && 'credentials' in user && user.credentials) {
			const passwordMatch = await comparePasswords(password, user.credentials.passwordHash);
			if (passwordMatch) {
				return json(
					{
						user: {
							first_name: user.firstName,
							lastName: user.lastName,
							username: user.username,
							email: user.email,
							bio: user.bio,
							id: user.id,
						},
						message: `${user.firstName}, you've signed in successfully!`,
					},
					200
				);
			} else {
				return json(
					{
						message: 'Incorrect username or password. Please try again.',
					},
					403
				);
			}
		}
	}
};

export default function SignIn() {
	const authFetcher = useFetcher<typeof action>();
	const passwordRef = useRef<HTMLInputElement>(null);
	const actionData = authFetcher.data as ActionData;
    console.log(actionData?.message ?? "No message");
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
						name='password'
						className='p-2 rounded text-base focus:bg-white focus:text-black'
						aria-required='true'
						required
					></PasswordInput>
				</label>
				{actionData ? (
					<p className='text-white text-xs'>
						{actionData ? actionData.message : null}
					</p>
				) : null}
				<button
					type='submit'
					className='p-2 w-auto mt-2 bg-cyan-950 text-white rounded'
				>
					Sign in.
				</button>
				<span className='text-xs font-white mt-2'>
					Not a member yet?{' '}
					<a
						href='/sign-up'
						className='underline'
					>
						Sign up.
					</a>
				</span>
			</div>
		</authFetcher.Form>
	);
}
