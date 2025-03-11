import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { getSampledStoriesWithAuthors, RandomStoryPreview } from './api.story.random';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from '@remix-run/react';

export const meta: MetaFunction = () => {
	return [{ title: 'Telemetry' }, { name: 'description', content: 'This is Telemetry.' }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	console.log("Received request")
	const storyUrl = `${
			(process.env.NODE_ENV === 'production'
				? 'https://telemetry.blog'
				: 'http://localhost:5173') + '/api/story/random?count=5'
		}`;
	const randomStories: RandomStoryPreview[] = await fetch(
		storyUrl,
	).then((res) => {
		return res.json();
	}).catch((error) => {
		return [];
	});
	return json({ randomStories });
};

/**
 * This functiong generates random styles to be applied to story titles in the background of the page.
 * It varies typefaces between font-serif and font-sans, font-weights between font-normal and font-semibold,
 * and color between text-stone-500 and text-stone-700.
 */
function generateRandomStyles(seed: string): string {
	const typefaces = ['font-serif', 'font-sans'];
	const fontWeights = ['font-light', 'font-normal', 'font-semibold', 'font-bold'];
	const colors = ['text-stone-400', 'text-stone-500', 'text-emerald-900', 'text-stone-700', 'text-amber-700',];
	const randomTypeface = typefaces[Math.floor(Math.random() * typefaces.length)];
	const randomFontWeight = fontWeights[Math.floor(Math.random() * fontWeights.length)];
	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomStyle = Math.floor(Math.random() * 10) % 2 === 0 ? 'italic' : 'normal';
	return `${randomTypeface} ${randomFontWeight} ${randomColor} ${randomStyle}`;
}

export default function Index() {
	const { randomStories } = useLoaderData<{ randomStories: RandomStoryPreview[] }>();
	return (
		<div className='relative flex flex-col gap-2 w-full min-h-screen justify-center items-center'>
			<p className='-z-0 absolute w-full h-full overflow-y-scroll overflow-x-clip no-scrollbar cursor-pointer select-none bg-stone-100 dark:bg-stone-900 md:p-16 text-5xl break-words md:text-[8rem] tracking-tighter leading-[0.80] text-justify blur-[2px] opacity-85 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1.0)_0%,transparent_100%)]'>
				{randomStories.map((story, index) => (
					<Link
						key={index}
						to={`/story/${story.id}`}
						className={`${generateRandomStyles(story.title)} animate-fade-in`}					>
						{story.title}&nbsp;
					</Link>
				))}
			</p>
			<p className='z-10 animate-fade-in p-6 text-center'>Telemetry is a place to blog without distractions, and with your whole personality.</p>
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
