import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { RandomStoryPreview } from './api.story.random';

import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from '@remix-run/react';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
	return [{ title: 'Telemetry' }, { name: 'description', content: 'This is Telemetry.' },
		{
			property: 'og:title',
			content: 'Telemetry',
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'og:description',
			content: 'Telemetry is a place to blog without distractions, and with your whole personality.',
		},
		{
			property: 'og:url',
			content: 'https://telemetry.blog',
		}
	];
};

/**
 * This functiong generates random styles to be applied to story titles in the background of the page.
 * It varies typefaces between font-serif and font-sans, font-weights between font-normal and font-semibold,
 * and color between text-stone-500 and text-stone-700.
 */
function generateRandomStyles(seed: string): string {
	const typefaces = ['font-serif', 'font-sans'];
	const fontWeights = ['font-light', 'font-normal', 'font-semibold', 'font-bold'];
	const colors = [
		'text-stone-400',
		'text-stone-500',
		'text-emerald-900',
		'text-stone-700',
		'text-amber-700',
	];
	const randomTypeface = typefaces[Math.floor(Math.random() * typefaces.length)];
	const randomFontWeight = fontWeights[Math.floor(Math.random() * fontWeights.length)];
	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomStyle = Math.floor(Math.random() * 10) % 2 === 0 ? 'italic' : 'normal';
	return `${randomTypeface} ${randomFontWeight} ${randomColor} ${randomStyle}`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const storyUrl = `${
		(process.env.NODE_ENV === 'production'
			? 'https://telemetry.blog'
			: 'http://localhost:5173') + '/api/story/random?count=5'
	}`;
	const randomStories: RandomStoryPreview[] = await fetch(storyUrl)
		.then((res) => {
			return res.json();
		})
		.catch((error) => {
			return [];
		});
	randomStories.forEach((story) => (story.style = generateRandomStyles(story.id)));
	return json({ randomStories });
};

function CountBadge({ count }: { count: number }) {
	return (
		<span className='bg-amber-400 rounded-full font-semibold font-sans px-4 py-2 md:py-2 md:px-6 text-stone-900 text-2xl md:text-6xl not-italic -my-10 animate-fade-in'>
			{count}
		</span>
	);
}

export default function Index() {
	const { randomStories } = useLoaderData<{
		randomStories: (RandomStoryPreview & { style: string })[];
	}>();
	const defaultCounts = Object.fromEntries(randomStories.map((story) => [story.id, 0]));
	const [counts, setCounts] = useState<Record<string, number>>(defaultCounts);

	useEffect(() => {
		(async () => {
			const users = await fetch(
				'https://telemetry-party.utkarshpant.partykit.dev/parties/telemetry/central',
				{
					body: JSON.stringify({
						storyIds: randomStories.map((story) => story.id),
						action: 'query',
					}),
					method: 'POST',
				}
			)
				.then((res) => {
					return res.json();
				})
				.catch((error) => {
					console.log(error);
				});
			setCounts(users);
		})();
	}, []);

	return (
		<div className='relative flex flex-col gap-2 w-full min-h-screen justify-center items-center overflow-hide no-scrollbar'>
			<p className='-z-0 absolute w-full h-full overflow-y-scroll overflow-x-clip no-scrollbar cursor-pointer select-none bg-stone-100 dark:bg-stone-900 md:p-16 text-5xl break-words md:text-[8rem] tracking-tighter leading-[0.80] text-justify blur-[2px] opacity-85 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1.0)_0%,transparent_100%)] animate-grow no-scrollbar'>
				{randomStories.map((story, index) => (
					<Link
						key={index}
						to={`/story/${story.id}`}
						className={`${story.style} animate-fade-in`}
					>
						{story.title} <CountBadge count={counts[story.id]} />
						&nbsp;
					</Link>
				))}
			</p>
			<p className='z-10 animate-fade-in p-6 text-center'>
				Telemetry is a place to blog without distractions, and with your whole personality.
			</p>
			<a
				href='/sign-in'
				className='z-10 underline animate-fade-in'
			>
				Start writing.
			</a>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<div className='p-12'>
				<h1 className='text-6xl'>Sorry, we couldn&apos;t find that page.</h1>
			</div>
		);
	}
	return <h1>Sorry, something went wrong.</h1>;
}
