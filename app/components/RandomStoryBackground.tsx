import { useLoaderData, Link, useRouteLoaderData } from '@remix-run/react';
import React, { useState, useEffect } from 'react';
import { RandomStoryPreview } from '~/routes/api.story.random';

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

/**
 *
 * @param count - The count of users on a page.
 * @returns a yellow badge indicating the number of users on a page. Inspired by https://interconnected.org/home
 */
function CountBadge({ count }: { count: number }) {
	return (
		<span className='bg-amber-400 rounded-full font-semibold font-sans px-4 py-2 md:py-2 md:px-6 text-stone-900 text-2xl md:text-6xl not-italic -my-10 animate-fade-in'>
			{count}
		</span>
	);
}

export function RandomStoryBackground({ children }: { children?: React.ReactNode }) {
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
			{children ?? null}
		</div>
	);
}

export function RandomStoryBackgroundErrorBoundary({ children }: { children?: React.ReactNode }) {
	const [counts, setCounts] = useState<Record<string, number>>({});
	const [randomStories, setRandomStories] = useState<{
        randomStories: (RandomStoryPreview & { style: string })[];
    }>([]);
	useEffect(() => {
		(async () => {
            const randomStories: RandomStoryPreview[] = await fetch(
				window.location.protocol + "//" + window.location.host + '/api/story/random?count=5'
			)
				.then((res) => {
					return res.json();
				})
				.catch((error) => {
					console.log(error);
					return [];
				});
            setRandomStories(randomStories);
			const defaultCounts: Record<string, number> = {};
			randomStories.forEach((story) => {
                story.style = generateRandomStyles(story.title);
				defaultCounts[story.id] = 0;
			});
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
			<p className='-z-0 absolute w-full h-full overflow-y-scroll overflow-x-clip no-scrollbar cursor-pointer select-none bg-stone-100 dark:bg-stone-900 md:p-16 text-5xl break-words md:text-[8rem] tracking-tighter leading-[0.80] text-justify blur-[2px] opacity-100 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1.0)_0%,transparent_100%)] animate-grow no-scrollbar'>
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
			{children ?? null}
		</div>
	);
}
