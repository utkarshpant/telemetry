import useUser from '~/hooks/useUser';
import SignedIn from '../SignedIn';
import { SignOut } from '~/routes/_auth.sign-out';

export default function Header() {
	const { user, signedIn } = useUser();
	const greeting = getGreetingByTimeOfDay();
	return (
		<header className='fixed top-0 left-0 z-10 w-full py-6 px-6 flex flex-row justify-between items-baseline bg-white dark:bg-emerald-800 dark:text-white text-neutral-950'>
			<div className='w-full md:w-10/12 flex flex-row justify-between m-auto'>
				<SignedIn>
					<span className='text-2xl tracking-tight font-bold'>Telemetry</span>
				</SignedIn>
				<SignOut />
			</div>
		</header>
	);
}
