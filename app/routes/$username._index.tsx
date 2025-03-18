import { Story, User } from '@prisma/client';
import { LoaderFunction } from '@remix-run/node';
import {
	Link,
	MetaFunction,
	isRouteErrorResponse,
	json,
	redirect,
	useHref,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { getLocaleDateString, getReadingTime } from 'utils/utils';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { NewStoryButton } from './home';
import { Chip } from '~/components/Chip/Chip';
import { StoryCardProps } from './home._index';
import Header from '~/components/Header/Header';
import { RandomStoryBackground, RandomStoryBackgroundErrorBoundary } from '~/components/RandomStoryBackground';

export const meta: MetaFunction = ({ data }: { data: { user: User } }) => {
	if (data?.user) {
		return [
			{ title: `${data?.user.firstName} | Telemetry` },
			{
				name: 'description',
				content: 'Sign into your Telemetry account.',
			},
			{
				property: 'og:type',
				content: 'profile',
			},
			{
				property: 'og:description',
				content: `These are ${data.user.firstName}'s stories on Telemetry.`,
			},
			{
				property: 'og:url',
				content: `https://telemetry.blog/${data.user.username}`,
			},
		];
	}
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session?.get('user')?.username === params.username) {
		return redirect('/home');
	}
	const { username } = params;
	try {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				username,
			},
		});
		if (user) {
			const { id } = user;
			const stories = await prisma.story.findMany({
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
			});
			return json({
				user,
				stories,
			});
		}
	} catch (error) {
		throw new Response("Sorry, we don't know who that is!", { status: 404 });
	}
	return null;
};

function StoryCard({ story }: StoryCardProps) {
	if (story.publishedAt) {
		const publishDelta = Date.now() - new Date(story.publishedAt).getTime();
		const daysSincePublished = Math.floor(publishDelta / (1000 * 60 * 60 * 24));
		return (
			<div
				key={story.id}
				className='flex flex-col gap-1 overflow-scroll no-scrollbar'
			>
				<span className='text-base font-medium tracking-tight flex flex-row gap-1 items-center flex-wrap'>
					<Link
						to={`/story/${story.id}`}
						className='hover:underline'
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
				<p className='text-base text-stone-700 dark:text-stone-400 font-light'>
					{story.subtitle}
				</p>
				<span className='text-xs text-stone-600 dark:text-stone-400 border-b border-b-stone-400 dark:border-b-stone-600 pb-2 flex flex-row gap-1 flex-wrap items-center'>
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

	return (
		<>
			<Header />
			<div className='flex flex-col-reverse md:flex-row items-start justify-center w-full min-h-screen no-scrollbar'>
				<div className='h-full w-full md:w-1/5 p-6 md:p-12 md:pr-6 md:border-l border-l-stone-400 dark:border-l-stone-700 md:border-none no-scrollbar flex flex-col gap-4 content-evenly flex-shrink-0'>
					<h1 className='text-xl tracking-tight font-medium'>About</h1>
					{user.bio ? (
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
								className='scroll no-scrollbar text-sm bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white rounded mt-2 px-6 py-4 -mx-6 md:-ml-6 md:-mx-0 md:px-6 backdrop-blur-2xl'
							>
								{user.bio}
							</div>
							{/* </div> */}
						</div>
					) : null}
					<div className='flex flex-row justify-between w-full gap-1'>
						<div className='flex flex-col gap-2'>
							<h2 className='text-sm uppercase text-stone-400'>Member since</h2>
							<p className='text-lg md:text-base'>
								{getLocaleDateString(user.createdAt)}
							</p>
						</div>
						<div>
							<p className='capitalize font-semibold bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center mr-6'>
								{user.firstName.charAt(0)}
								{user.lastName?.charAt(0)}
							</p>
						</div>
					</div>
				</div>
				<div className='p-6 md:p-12 md:pl-6 w-full md:w-4/5 h-min-h-screen flex flex-col gap-4 overflow-y-scroll md:border-l border-l-stone-700 dark:border-l-stone-700 no-scrollbar flex-1 flex-shrink-0 md:min-h-screen'>
					<div className='flex flex-col gap-4 flex-1 h-full no-scrollbar'>
						<span className='text-xl font-medium'>
							{' '}
							{user.firstName}&apos;s stories
						</span>
						<div className='h-full'>
							<div className='flex flex-col gap-4'>
								{stories.length > 0 ? (
									stories.map((story) => (
										<StoryCard
											key={story.id}
											story={story}
										/>
									))
								) : (
									<div className='w-full flex flex-row items-center text-sm dark:text-stone-500 text-stone-400 justify-center h-[56vh] text-center select-none'>
										{user.firstName} hasn&apos;t published any stories &mdash;
										yet. They might have something in the works!
									</div>
								)}
							</div>
						</div>
					</div>
					<div className='fixed bottom-6 right-12'>
						<NewStoryButton />
					</div>
				</div>
			</div>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<RandomStoryBackgroundErrorBoundary>
			<div className='p-12 bg-neutral-950 bg-opacity-80 h-screen w-screen z-0'>
				<h1 className='text-6xl'>
					{error.status} {error.statusText}
				</h1>
				<p className='my-4'>{error.data}</p>
				<p>Head over to <Link to='/' className='underline'>the home page</Link> to check out what Telemetry members are writing, or even <Link to='/sign-up' className='underline'>sign-up</Link> yourself!</p>
			</div>
			</RandomStoryBackgroundErrorBoundary>
		);
	} else if (error instanceof Error) {
		return (
			<div>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
