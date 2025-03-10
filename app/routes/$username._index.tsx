import { Story, User } from '@prisma/client';
import { LoaderFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Link, MetaFunction, Outlet, json, redirect, useHref, useLoaderData, useLocation } from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { getLocaleDateString, getReadingTime } from 'utils/utils';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import InfoIcon from '~/assets/info-icon';
import { NewStoryButton } from './home';

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
					}
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

export default function UserProfile() {
	const { user, stories } = useLoaderData<{ user: User; stories: Story[] }>();
	const userHref = useHref('.', { relative: 'path' });
	return (
		<div className='flex flex-col-reverse md:flex-row items-center justify-center w-full h-screen'>
			<div className='h-min md:h-full w-full md:w-1/4 p-6 md:p-12 md:pr-6 md:border-r border-r-stone-400 dark:border-r-stone-700 flex flex-col gap-6 content-evenly'>
				<h1 className='text-2xl md:text-6xl tracking-tighter'>About</h1>
				<div className='flex flex-col gap-1'>
					<h2 className='text-sm uppercase text-stone-400'>Bio</h2>
					<p className='text-lg md:text-base'>{user.bio}</p>
				</div>
				<div className='flex flex-col gap-1'>
					<h2 className='text-sm uppercase text-stone-400'>Member since</h2>
					<p className='text-lg md:text-base'>{getLocaleDateString(user.createdAt)}</p>
				</div>
				<div className='flex flex-col gap-1'>
					<p className='capitalize font-semibold bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center'>{user.firstName.charAt(0)}{user.lastName?.charAt(0)}</p>
				</div>
			</div>
			<div className='p-6 md:p-12 md:pl-6 w-full md:w-4/5 h-full flex flex-col gap-4'>
				<h1 className='text-2xl md:text-6xl tracking-tighter'>
					{user.firstName}&nbsp;{user.lastName ? user.lastName : ''}{' '}
					<a
						href={userHref}
						className='text-stone-400 underline underline-offset-4 decoration-4'
					>
						({user.username})
					</a>
				</h1>
				<div className='flex flex-col gap-4'>
					<h2 className='text-2xl font-medium'>Stories</h2>
					{stories.map((story) => {
						const publishDelta = Date.now() - Date.parse(story.publishedAt as string);
						const daysSincePublished = Math.floor(publishDelta / (1000 * 60 * 60 * 24));
						return (
							<div
								key={story.id}
								className='flex flex-col gap-1'
							>
								<h3 className='text-2xl tracking-tight underline'>
									<Link to={`/story/${story.id}`}>{story.title}</Link>
								</h3>
								<span className='text-sm text-stone-600 dark:text-stone-400 flex items-center border-b border-b-stone-400 dark:border-b-stone-600 pb-2'>
									Published {getLocaleDateString(story.publishedAt as string)}.
									<span className='bg-amber-400 transition-colors p-1 text-xs rounded m-2 text-neutral-950 flex flex-row justify-between items-center max-w-min'>
										<InfoIcon className='text-amber-100 h-4' />
										<span className='w-max'>
											{getReadingTime(story.wordCount)} minute read.
										</span>
									</span>
									{daysSincePublished < 4 ? (
										<span className='capitalize p-1 px-2 bg-cyan-900 text-white text-xs rounded'>New!</span>
									) : null}
								</span>

								<p className='text-lg'>{story.subtitle}</p>
							</div>
						);
					})}
				</div>
				<div className='fixed bottom-6 right-6'>
					<NewStoryButton />
				</div>
			</div>
		</div>
	);
}
