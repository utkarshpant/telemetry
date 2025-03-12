import useUser from '~/hooks/useUser';
import { Link } from '@remix-run/react';

export default function Header() {
	const { user, signedIn } = useUser();
	return (
		<header className='z-10 w-full py-6 px-6 md:px-12 flex flex-row justify-between items-baseline border-b border-b-stone-700 dark:text-white text-neutral-950'>
			<span className='flex flex-row justify-between w-full'>
				<Link to="/" className='text-xl tracking-tighter font-medium'>Telemetry</Link>
				{signedIn ? (
					<h1 className='text-xl tracking-tight'>
					{user.firstName}&nbsp;
					{user.lastName ? user.lastName : ''}{' '}
					<Link
						to={`/${user.username}`}
						className='text-xl tracking-tighter hover:underline underline-offset-4 decoration-4'
					>
						({user.username})
					</Link>
				</h1>
				) : <Link to='/sign-in' className=' hover:underline tracking-tight text-xl'>Sign In</Link>}
			</span>
		</header>
	);
}
