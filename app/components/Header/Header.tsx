import useUser from '~/hooks/useUser';
import SignedIn from '../SignedIn';
import { SignOut } from '~/routes/_auth.sign-out';

function getGreetingByTimeOfDay() {
	const now = new Date();
	const currentHour = now.getHours();
	if (currentHour < 12) {
		return 'Good morning';
	} else if (currentHour < 18) {
		return 'Good afternoon';
	} else {
		return 'Good evening';
	}
}

export default function Header() {
	const { user, signedIn } = useUser();
	const greeting = getGreetingByTimeOfDay();
	return (
		<header className='fixed top-0 left-0 w-full py-6 px-12 flex flex-row justify-between items-baseline bg-white dark:bg-stone-900 dark:text-white text-neutral-950'>
			<div className='w-full md:w-2/3 flex flex-row justify-between m-auto'>
				<SignedIn>
					<span className='text-2xl tracking-tight font-bold'>Telemetry</span>
				</SignedIn>
				<SignOut />
			</div>
		</header>
	);
}
