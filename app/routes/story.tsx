import { Outlet } from '@remix-run/react';

export default function StoryLayout() {
	return (
		<div className='w-full h-screen'>
			<Outlet />
		</div>
	);
}
