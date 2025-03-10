import { LoaderFunctionArgs } from '@remix-run/node';
import {
	json,
	Link,
	Outlet,
	redirect,
	useFetcher,
	useHref,
	useLoaderData,
	useLocation,
} from '@remix-run/react';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { getGreetingByTimeOfDay, getLocaleDateString, getReadingTime } from 'utils/utils';
import useUser from '~/hooks/useUser';
import { useState } from 'react';
import { SignOut } from './_auth.sign-out';
import SignedIn from '~/components/SignedIn';
import { prisma } from 'prisma/db.server';
import { Story } from '@prisma/client';
import InfoIcon from '~/assets/info-icon';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return redirect('/sign-in', 302);
	}
	return null;
};

export function NewStoryButton() {
	const fetcher = useFetcher();
	return (
		<button
			className='px-4 py-2 rounded w-52 text-base bg-green-600 hover:bg-green-500 hover:drop-shadow-lg hover:scale-[1.0125] transition-all text-white'
			onClick={() => {
				fetcher.submit(null, {
					method: 'POST',
					action: '/story/new',
				});
			}}
		>
			Start a new story
		</button>
	);
}

function getNavTabClasses(active: boolean) {
	return `text-lg px-4 py-1 rounded-full ${active ? 'bg-stone-400 dark:bg-stone-700' : 'bg-stone-200 dark:bg-stone-800'}`;
}

export default function Home() {
	const { user, signedIn } = useUser();
	const fetcher = useFetcher();
	const [bioEditable, setBioEditable] = useState(false);
	const [textAreaLength, setTextAreaLength] = useState(user?.bio?.length ?? 0);
	const userHref = useHref('.', { relative: 'path' });
	const location = useLocation();

	if (signedIn)
		return (
			// <div className='w-full h-screen flex flex-col justify-between md:flex-row p-12 gap-2 items-start text-xl md:text-base'>
			// 	<div className='w-full md:min-w-10/12 mx-auto flex flex-col gap-4 p-0 md:p-8'>
			// 		<h1 className='font-semibold'>
			// 			{getGreetingByTimeOfDay()}, {user?.firstName}.
			// 		</h1>
			// 		<p>
			// 			Welcome home! Here, you can manage your stories, account settings, and other
			// 			aspects of your Telemetry experience.
			// 		</p>
			// 		{/* Name */}
			// 		<fetcher.Form
			// 			name='personal_info'
			// 			className='w-full md:w-fit flex flex-col gap-4'
			// 			method='PATCH'
			// 			action={`/api/user/${user?.id}`}
			// 		>
			// 			<fieldset
			// 				name='name'
			// 				className='flex flex-col md:flex-row gap-4'
			// 			>
			// 				<label className='flex flex-col gap-1'>
			// 					First name
			// 					<input
			// 						type='text'
			// 						name='firstName'
			// 						defaultValue={user?.firstName}
			// 						className='p-2 dark:bg-stone-700 bg-neutral-200 text-black dark:text-white rounded'
			// 					/>
			// 				</label>
			// 				<label className='flex flex-col gap-1'>
			// 					Last name
			// 					<input
			// 						type='text'
			// 						name='lastName'
			// 						defaultValue={user?.lastName ?? ''}
			// 						className='p-2 dark:bg-stone-700 bg-neutral-200 text-black dark:text-white rounded'
			// 					/>
			// 				</label>
			// 			</fieldset>
			// 			<fieldset
			// 				name='email_and_username'
			// 				className='flex flex-col gap-2 disabled:bg-neutral-100 dark:disabled:bg-stone-100 dark:disabled:bg-opacity-5 md:max-w-fit px-12 p-4 pb-6 md:pb-4 md:rounded w-screen md:w-fit -mx-12 md:-mx-4 md:px-4'
			// 				disabled
			// 			>
			// 				<p className='text-base text-neutral-600 dark:text-neutral-200'>
			// 					Updating your email and username is currently disabled.
			// 				</p>
			// 				<div className='flex flex-col md:flex-row gap-4'>
			// 					<label className='flex flex-col gap-1'>
			// 						Email
			// 						<input
			// 							type='email'
			// 							name='email'
			// 							defaultValue={user?.email}
			// 							className='p-2 dark:bg-stone-700 w-full bg-neutral-200 text-black dark:text-white rounded disabled:text-neutral-600 dark:disabled:text-neutral-200'
			// 							// disabled
			// 						/>
			// 					</label>
			// 					<label className='flex flex-col gap-1'>
			// 						Username
			// 						<input
			// 							type='text'
			// 							name='username'
			// 							defaultValue={user?.username}
			// 							className='p-2 dark:bg-stone-700 w-full bg-neutral-200 text-black dark:text-white rounded disabled:text-neutral-600 dark:disabled:text-neutral-200'
			// 							// disabled
			// 						/>
			// 					</label>
			// 				</div>
			// 			</fieldset>
			// 			<label className='flex flex-col gap-2 -mt-2 w-full'>
			// 				<span>
			// 					Bio <span className='text-neutral-400'>({textAreaLength}/250)</span>
			// 				</span>
			// 				<textarea
			// 					className='p-2 rounded bg-neutral-200 dark:bg-stone-700 resize-none h-48 text-black dark:text-white placeholder:text-neutral-400'
			// 					maxLength={250}
			// 					name='bio'
			// 					defaultValue={user?.bio as string}
			// 					placeholder='Tell us a little about yourself.'
			// 					onChange={(event) => {
			// 						setTextAreaLength(event.target.value.length);
			// 					}}
			// 				></textarea>
			// 			</label>
			// 			<button
			// 				className='w-full md:w-52 bg-amber-600 text-white p-2 rounded'
			// 				onClick={() => {}}
			// 			>
			// 				Update profile
			// 			</button>
			// 		</fetcher.Form>
			// 		<div></div>
			// 	</div>
			// 	<div className='w-full md:w-1/3 flex flex-col gap-4 p-0 md:p-8 pb-12'>
			// 		<h1 className='font-semibold'>Account</h1>
			// 		<SignOut />
			// 		<NewStoryButton />
			// 	</div>
			// </div>
			<div className='flex flex-col-reverse md:flex-row items-center justify-center w-full h-screen overflow-hidden'>
				<div className='h-full w-full md:w-1/4 p-6 md:p-12 md:pr-6 md:border-r border-r-stone-400 dark:border-r-stone-700 flex flex-col gap-6 content-evenly flex-1 shadow-2xl shadow-neutral-600 dark:shadow-neutral-100 md:shadow-none'>
					<h1 className='text-2xl md:text-6xl tracking-tighter'>About</h1>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='bio'
							className='text-sm uppercase text-stone-400 flex flex-col gap-1'
						>
							Bio
						</label>
						<span
							contentEditable={bioEditable}
							id='bio'
							role='textbox'
							tabIndex={0}
							title='User bio'
							className='scroll no-scrollbar text-lg md:text-base bg-stone-200 dark:bg-stone-800 h-max md:rounded px-6 py-4 -mx-6 md:-ml-6 md:-mx-0 md:px-6'
							onFocus={() => {
								if (!bioEditable) {
									setBioEditable(true);
								}
							}}
							onClick={() => {
								if (!bioEditable) {
									setBioEditable(true);
								}
							}}
							onBlur={() => {
								setBioEditable(false);
							}}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									setBioEditable(true);
								}
							}}
						>
							{user.bio}
						</span>
					</div>
					<div className='flex flex-col gap-1'>
						<h2 className='text-sm uppercase text-stone-400'>Member since</h2>
						<p className='text-lg md:text-base'>
							{getLocaleDateString(user.createdAt)}
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='capitalize font-semibold bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center'>
							{user.firstName.charAt(0)}
							{user.lastName?.charAt(0)}
						</p>
					</div>
				</div>
				<div className='p-6 md:p-12 md:pl-6 w-full md:w-4/5 h-full flex flex-col gap-4 overflow-scroll'>
					<h1 className='text-2xl md:text-6xl tracking-tighter'>
						{user.firstName}&nbsp;
						{user.lastName ? user.lastName : ''}{' '}
						<a
							href={userHref}
							className='text-stone-400 underline underline-offset-4 decoration-4'
						>
							({user.username})
						</a>
					</h1>
					<div className='flex flex-col gap-4 flex-1 h-full'>
						<nav className='flex flex-row gap-4'>
							<a
								href='/home'
								className={getNavTabClasses(location.pathname === '/home')}
							>
								Stories
							</a>
							<a
								href='/home/settings'
								className={getNavTabClasses(location.pathname === '/home/settings')}
							>
								Settings
							</a>
						</nav>
						<div className='h-full'>
							<Outlet />
						</div>
					</div>
					<div className='fixed bottom-6 right-12'>
						<NewStoryButton />
					</div>
				</div>
			</div>
		);
}
