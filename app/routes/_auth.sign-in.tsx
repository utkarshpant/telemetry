/* eslint-disable no-mixed-spaces-and-tabs */
import {
	json,
	Location,
	redirect,
	useFetcher,
	useLocation,
	useSearchParams,
} from '@remix-run/react';
import { type MetaFunction, type ActionFunctionArgs, LoaderFunction } from '@remix-run/node';
import { prisma } from '../../prisma/db.server';
import {
	comparePasswords,
	commitSession,
	getSession,
	validateRequestAndReturnSession,
} from '~/auth/utils.server';
import { User } from '@prisma/client';
import PasswordInput from '~/components/PasswordInput';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Telemetry | Sign in' },
		{ name: 'description', content: 'Sign into your Telemetry account.' },
	];
};

export const loader: LoaderFunction = async ({ request }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		return redirect('/home');
	}
	return null;
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
 * 1. Extracts form data from the request.
 * 2. Retrieves the user from the database based on the provided email or username.
 * 3. If the user is not found, returns a 404 response with an error message.
 * 4. If the user is found, verifies the provided password against the stored password hash.
 * 5. If the password matches, creates a session and returns a 200 response with the user data and a success message.
 * 6. If the password does not match, returns a 403 response with an error message.
 *
 * @throws {Error} If an error occurs while retrieving the user from the database.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const emailOrUsername = formData.get('email_or_username') as string;
	const password = formData.get('password') as string;
	const user = await prisma.user
		.findFirst({
			where: {
				OR: [
					{ email: emailOrUsername.toLowerCase() },
					{ username: emailOrUsername.toLowerCase() },
				],
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
				// create a new session
				const cookies = request.headers.get('Cookie');
				const session = await getSession(cookies);
				session.set(
					'ipAddress',
					process.env.NODE_ENV === 'production'
						? request.headers.get('X-Forwarded-For')
						: '127.0.0.1'
				);
				session.set('userId', user.id);
				session.set('userAgent', request.headers.get('User-Agent'));
				return redirect('/home', {
					headers: {
						'Set-Cookie': await commitSession(session),
					},
				});
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
	const actionData = authFetcher.data as ActionData;
	const [searchParams] = useSearchParams();
	const location = useLocation();

	function getDefaultEmail(
		searchParams: URLSearchParams,
		location: Location
	): string | number | readonly string[] | undefined {
		if (searchParams.has('email')) {
			return searchParams.get('email') as string;
		} else if (location.state && 'email' in location.state) {
			return location.state.email;
		} else {
			return '';
		}
	}

	return (
		<div className='w-full h-full flex p-12'>
			<authFetcher.Form
				method='POST'
				className='flex flex-col m-auto rounded gap-2 text-base'
				action='?index&intent=sign_in'
			>
				{/* Row 1 */}
				<div className='max-w-full flex flex-row gap-2'>
					<label
						htmlFor='email_or_username'
						className='flex flex-col w-full'
					>
						<span>
							Email or Username<span className='text-red-600 font-semibold'>*</span>
						</span>
						<input
							type='text'
							name='email_or_username'
							defaultValue={getDefaultEmail(searchParams, location)}
							className='p-2 rounded bg-neutral-200 dark:bg-stone-300 dark:bg-opacity-35 text-black dark:text-white'
							aria-required='true'
							required
						></input>
					</label>
				</div>

				{/* Row 2 */}
				<div className='w-full flex flex-col gap-2'>
					<label
						htmlFor='password'
						className='flex flex-col w-full'
					>
						<span>
							Password<span className='font-semibold text-red-600'>*</span>
						</span>
						<PasswordInput
							name='password'
							aria-required='true'
							required
						></PasswordInput>
					</label>
					{actionData ? (
						<span className='max-w-full break-words'>
							{actionData ? actionData.message : null}
						</span>
					) : null}
					<button
						type='submit'
						className='p-2 w-full mt-2 bg-cyan-950 text-white rounded'
					>
						Sign in.
					</button>
					<span className='font-white'>
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
		</div>
	);
}
