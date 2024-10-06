import { type MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
	return [{ title: 'Telemetry' }, { name: 'description', content: 'This is Telemetry.' }];
};

export default function Index() {
	return (
		<div className='flex flex-col gap-2 w-full h-screen justify-center items-center'>
			<p>This is the landing page.</p>
			<a href='/sign-in' className='underline'>Start writing.</a>
		</div>
	);
}
