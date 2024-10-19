import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useFetcher } from '@remix-run/react';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { getGreetingByTimeOfDay } from 'utils/utils';
import useUser from '~/hooks/useUser';
import { useRef, useState } from 'react';
import LogoutIcon from '../assets/logout-material-icon.svg?url';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return redirect('/sign-in', 302);
	} else {
		return null;
	}
};

export function NewStoryButton() {
	const fetcher = useFetcher();
	return (
		<button
			className='px-4 py-1 bg-sky-900 rounded w-56 text-base'
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

export default function Home() {
	const { user } = useUser();
	const [hasPreview, setHasPreview] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const fetcher = useFetcher();
	const [textAreaLength, setTextAreaLength] = useState(0);
	return (
		<div className='w-full h-screen flex flex-col justify-between md:flex-row p-12 gap-2 items-start text-xl md:text-base'>
			<div className='w-full md:min-w-10/12 mx-auto flex flex-col gap-4 p-0 md:p-8'>
				<h1 className='font-semibold'>
					{getGreetingByTimeOfDay()}, {user?.firstName}.
				</h1>
				<p>
					Welcome home! Here, you can manage your stories, account settings, and other
					aspects of your Telemetry experience.
				</p>
				{/* Name */}
				<fetcher.Form
					name='personal_info'
					className='w-full md:w-fit flex flex-col gap-4'
					method='PATCH'
					action={`/api/user/${user?.id}`}
				>
					<fieldset
						name='name'
						className='flex flex-col md:flex-row gap-4'
					>
						<label className='flex flex-col gap-1'>
							First name
							<input
								type='text'
								name='firstName'
								defaultValue={user?.firstName}
								className='p-2 dark:bg-stone-700 bg-neutral-200 text-black dark:text-white rounded'
							/>
						</label>
						<label className='flex flex-col gap-1'>
							Last name
							<input
								type='text'
								name='lastName'
								defaultValue={user?.lastName ?? ''}
								className='p-2 dark:bg-stone-700 bg-neutral-200 text-black dark:text-white rounded'
							/>
						</label>
					</fieldset>
					<fieldset
						name='email_and_username'
						className='flex flex-col gap-2 disabled:bg-neutral-100 dark:disabled:bg-stone-100 dark:disabled:bg-opacity-5 md:max-w-fit px-12 p-4 pb-6 md:pb-4 md:rounded w-screen md:w-fit -mx-12 md:-mx-4 md:px-4'
						disabled
					>
						<p className='text-base text-neutral-600 dark:text-neutral-200'>
							Updating your email and username is currently disabled.
						</p>
						<div className='flex flex-col md:flex-row gap-4'>
							<label className='flex flex-col gap-1'>
								Email
								<input
									type='email'
									name='email'
									defaultValue={user?.email}
									className='p-2 dark:bg-stone-700 w-full bg-neutral-200 text-black dark:text-white rounded disabled:text-neutral-600 dark:disabled:text-neutral-200'
									// disabled
								/>
							</label>
							<label className='flex flex-col gap-1'>
								Username
								<input
									type='text'
									name='username'
									defaultValue={user?.username}
									className='p-2 dark:bg-stone-700 w-full bg-neutral-200 text-black dark:text-white rounded disabled:text-neutral-600 dark:disabled:text-neutral-200'
									// disabled
								/>
							</label>
						</div>
					</fieldset>
					<label className='flex flex-col gap-2 -mt-2 w-full'>
						<span>
							Bio <span className='text-neutral-400'>({textAreaLength}/250)</span>
						</span>
						<textarea
							className='p-2 rounded bg-neutral-200 dark:bg-stone-700 resize-none h-48 text-black dark:text-white placeholder:text-neutral-400'
							maxLength={250}
							name='bio'
							defaultValue={user?.bio}
							placeholder='Tell us a little about yourself.'
							onChange={(event) => {
								setTextAreaLength(event.target.value.length);
							}}
						></textarea>
					</label>
					<button className='w-full md:w-52 bg-amber-600 text-white p-2 rounded' onClick={() => {

					}}>Update profile</button>
				</fetcher.Form>
				<div></div>
			</div>
			<div className='w-full md:w-1/3 flex flex-col gap-4 p-0 md:p-8 pb-12'>
				<h1 className='font-semibold'>Account</h1>
				<button className='w-full md:w-52 bg-sky-900 py-2 px-4 rounded text-white items-center justify-center flex flex-row gap-2' type='submit'>
					<img
						src={LogoutIcon}
						className='h-4'
						alt='Logout icon'
					/>{' '}
					Sign out
				</button>
			</div>
		</div>
	);
}
