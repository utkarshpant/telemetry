import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, redirect, useFetcher, useHref, useLocation } from '@remix-run/react';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { getLocaleDateString } from 'utils/utils';
import useUser from '~/hooks/useUser';
import { useEffect, useRef, useState } from 'react';

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
	return `text-lg px-4 py-1 rounded-full ${
		active ? 'bg-stone-400 dark:bg-stone-700' : 'bg-stone-200 dark:bg-stone-800'
	}`;
}

// const textAreaStateMap = {
// 	noError: ['oklch(0.145 0 0)', 'oklch(0.704 0.14 182.503)', 'oklch(0.398 0.07 227.392)'], // all good!
// 	hasError: ['oklch(0.455 0.188 13.697)', 'oklch(0.555 0.163 48.998)', 'oklch(0.396 0.141 25.723)'],
// };

// const getTextAreaClasses = (textAreaLength: number, bioEditable: boolean) => {
// 	if (bioEditable) {
// 		if (textAreaLength <= 250) {
// 			return 'before:from-stone-800 before:to-sky-700 ease-out duration-500 before:absolute before:left-[25%] before:top-[20%] before:w-[50%] before:h-[40%] before:bg-stone-800 before:rounded-full before:blur-[30px] before:brightness-125 before:bg-gradient-to-r  before:animate-blob before:-z-10 focus:ring-0 focus:outline-none outline-none before:bg-opacity-15';
// 		}
// 		else return 'before:from-stone-800 before:to-red-600 before:absolute before:left-[25%] before:top-[20%] before:w-[50%] before:h-[40%] before:bg-stone-800 before:rounded-full before:blur-[30px] before:brightness-125 before:bg-gradient-to-r before:animate-blob before:-z-10 focus:ring-0 focus:outline-none outline-none before:bg-opacity-15 after:absolute after:right-[5%] after:bottom-[10%] after:bg-opacity-45 after:w-[50%] after:h-[40%] after:bg-purple-600 after:rounded-full after:blur-[30px] after:brightness-125 after:animate-pulse after:-z-10 focus:ring-0 focus:outline-none outline-none before:bg-opacity-15'
// 	} else {
// 		return 'dark:bg-stone-700 bg-stone-400';
// 	}
// }

export default function Home() {
	const { user, signedIn } = useUser();
	const fetcher = useFetcher();
	const [bioEditable, setBioEditable] = useState(false);
	const [textAreaLength, setTextAreaLength] = useState(user?.bio?.length ?? 0);
	const userHref = useHref('.', { relative: 'path' });
	const location = useLocation();
	const textAreaRef = useRef<HTMLSpanElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	if (signedIn)
		return (
			<div className='flex flex-col-reverse md:flex-row items-center justify-center w-full h-screen overflow-hidden'>
				<div className='h-full w-full md:w-1/4 p-6 md:p-12 md:pr-6 md:border-r border-r-stone-400 dark:border-r-stone-700 flex flex-col gap-6 content-evenly flex-1 shadow-2xl shadow-neutral-600 dark:shadow-neutral-100 md:shadow-none bg-clip-content'>
					<h1 className='text-2xl md:text-6xl tracking-tighter'>About</h1>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='bio'
							className='text-sm uppercase text-stone-400 flex flex-col gap-1'
						>
							<span>
								Bio (
								<span className={`${textAreaLength > 250 ? 'text-red-500' : ''}`}>
									{textAreaLength}
								</span>
								/250)
							</span>
						</label>
						{/* <div
							ref={wrapperRef}
							className={`relative ${getTextAreaClasses(textAreaLength, bioEditable)} transition-colors ease-out duration-500 h-max md:rounded px-6 py-4 -mx-6 md:-ml-6 md:-mx-0 md:px-6 text-white backdrop-blur-2xl `}
						> */}
						<div
							contentEditable={bioEditable}
							id='bio'
							role='textbox'
							tabIndex={0}
							title='Your bio!'
							ref={textAreaRef}
							className='scroll no-scrollbar text-lg md:text-base bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white rounded px-6 py-4 -mx-6 md:-ml-6 md:-mx-0 md:px-6 backdrop-blur-2xl'
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
							onInput={(event) => {
								if (textAreaRef.current) {
									setTextAreaLength(textAreaRef.current.innerText.length);
								}
							}}
						>
							{user.bio}
						</div>
						{/* </div> */}
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
				<div className='p-6 md:p-12 md:pl-6 w-full md:w-4/5 h-full flex flex-col gap-4 overflow-y-scroll'>
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
