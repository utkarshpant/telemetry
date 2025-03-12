import { Story, User } from '@prisma/client';
import { LoaderFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
	Link,
	MetaFunction,
	Outlet,
	json,
	redirect,
	useFetcher,
	useHref,
	useLoaderData,
	useLocation,
} from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { getLocaleDateString, getReadingTime } from 'utils/utils';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import InfoIcon from '~/assets/info-icon';
import { NewStoryButton } from './home';
import { Chip } from '~/components/Chip/Chip';
import { StoryCardProps } from './home._index';

export const meta: MetaFunction = ({ data }) => {
	const user = data as User;
	if (user) {
		return [
			{ title: `${user.firstName} | Telemetry` },
			{ name: 'description', content: 'Sign into your Telemetry account.' },
		];
	}
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session?.get('user')?.username === params.username) {
		return redirect('/home');
	}
	const { username } = params;
	const user = await prisma.user
		.findUnique({
			where: {
				username,
			},
		})
		.catch((error) => {
			throw json({ message: 'User not found', error }, { status: 404 });
		});
	if (user) {
		const { id } = user;
		const stories = await prisma.story
			.findMany({
				where: {
					authors: {
						some: {
							userId: id,
						},
					},
					AND: {
						isPublished: true,
					},
				},
			})
			.catch((error) => {
				throw json(
					{ message: `There was an error fetching stories for ${user.username}.`, error },
					{ status: 404 }
				);
			});
		return json({
			user,
			stories,
		});
	}
	return null;
};

function StoryCard({ story }: StoryCardProps) {
	if (story.publishedAt) {
		const publishDelta = Date.now() - new Date(story.publishedAt);
		const daysSincePublished = Math.floor(publishDelta / (1000 * 60 * 60 * 24));
		return (
			<div
				key={story.id}
				className='flex flex-col gap-1 overflow-scroll no-scrollbar'
			>
				<span className='text-xl font-medium tracking-tight flex flex-row flex-wrap gap-1'>
					<Link
						to={`/story/${story.id}`}
						className='underline'
					>
						{story.title}
					</Link>
					{daysSincePublished < 4 ? (
						<Chip
							content='New!'
							variant='announcement'
						/>
					) : null}
				</span>
				<p className='text-lg text-stone-400 font-light'>{story.subtitle}</p>
				<span className='text-sm text-stone-600 dark:text-stone-400 flex items-center border-b border-b-stone-400 dark:border-b-stone-600 pb-2 gap-2'>
					{story.isPublished
						? `Published on ${getLocaleDateString(story.publishedAt)}.`
						: `Created on ${getLocaleDateString(story.createdAt)}.`}
					<p>{getReadingTime(story.wordCount)} minute read.</p>
				</span>
			</div>
		);
	}
}

export default function UserProfile() {
	const { user, stories } = useLoaderData<{ user: User; stories: Story[] }>();
	const userHref = useHref('.', { relative: 'path' });
	return (
		<div className='flex flex-col-reverse md:flex-row items-center justify-center w-full h-screen overflow-hidden'>
			<div className='h-full w-full md:w-1/4 p-6 md:p-12 md:pr-6 md:border-r border-r-stone-400 dark:border-r-stone-700 flex flex-col gap-6 content-evenly flex-1 shadow-2xl shadow-neutral-600 dark:shadow-neutral-100 md:shadow-none bg-clip-content'>
				<h1 className='text-2xl md:text-4xl tracking-tighter'>About</h1>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='bio'
						className='text-sm uppercase text-stone-400 flex flex-col gap-1'
					>
						Bio
					</label>
					<div
						id='bio'
						role='textbox'
						tabIndex={0}
						title={`${user.firstName}'s bio.`}
						className='scroll no-scrollbar text-lg md:text-base bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white rounded mt-2 px-6 py-4 -mx-6 md:-ml-6 md:-mx-0 md:px-6 backdrop-blur-2xl'
					>
						{user.bio}
					</div>
					{/* </div> */}
				</div>
				<div className='flex flex-row justify-between w-full gap-1'>
					<div className='flex flex-col gap-2'>
					<h2 className='text-sm uppercase text-stone-400'>Member since</h2>
					<p className='text-lg md:text-base'>{getLocaleDateString(user.createdAt)}</p>
					</div>
					<div>
						<p className='capitalize font-semibold bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center mr-6'>
							{user.firstName.charAt(0)}
							{user.lastName?.charAt(0)}
						</p>
					</div>
				</div>
			</div>
			<div className='p-6 md:p-12 md:pl-6 w-full md:w-4/5 h-full flex flex-col gap-4 overflow-y-scroll'>
				<h1 className='text-2xl md:text-4xl tracking-tighter'>
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
					<span className='text-xl'>Stories</span>
					<div className='h-full'>
						<div className='flex flex-col gap-4'>
							{stories.map((story) => (
								<StoryCard
									key={story.id}
									story={story}
								/>
							))}
						</div>
					</div>
				</div>
				<div className='fixed bottom-6 right-12'>
					<NewStoryButton />
				</div>
			</div>
		</div>
	);
}
