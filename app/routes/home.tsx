import { LoaderFunctionArgs } from '@remix-run/node';
import {
	Outlet,
	redirect,
	useFetcher,
	useHref,
	useLocation,
	useRevalidator,
} from '@remix-run/react';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { getLocaleDateString } from 'utils/utils';
import useUser from '~/hooks/useUser';
import { useEffect, useRef, useState } from 'react';
import EditIcon from '~/assets/edit-material-icon.svg?url';
import Header from '~/components/Header/Header';

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
			className='px-4 py-2 rounded-full text-sm bg-green-600 hover:drop-shadow-lg hover:scale-[1.0125] text-white flex flex-row gap-2 items-center h-14'
			onClick={() => {
				fetcher.submit(null, {
					method: 'POST',
					action: '/story/new',
				});
			}}
		>
			<img
				src={EditIcon}
				alt='New story'
				className='h-min w-min'
			/>
			<p className='md:group-hover:inline'>Inspired? Start writing.</p>
		</button>
	);
}

function getNavTabClasses(active: boolean) {
	return `text-sm px-4 py-1 rounded-full ${
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
			<div className='min-h-screen no-scrollbar'>
				<Header />
				<div className='flex flex-col-reverse md:flex-row items-start justify-center w-full'>
					<div className='p-6 md:p-12 w-full min-h-full flex flex-col gap-4 overflow-y-scroll flex-shrink-0 md:border-l border-l-stone-400 dark:border-l-stone-700 md:border-none no-scrollbar'>
						<div className='flex flex-col gap-4 flex-1 h-full justify-center'>
							<nav className='flex flex-row gap-4 items-center'>
								<a
									href='/home'
									className={getNavTabClasses(location.pathname === '/home')}
								>
									Stories
								</a>
								<a
									href='/home/settings'
									className={getNavTabClasses(
										location.pathname === '/home/settings'
									)}
								>
									Settings
								</a>
							</nav>
							<div className='h-full flex-1'>
								<Outlet />
							</div>
						</div>
						<div className='fixed bottom-6 right-6 md:right-12'>
							<NewStoryButton />
						</div>
					</div>
				</div>
			</div>
		);
}
