import { ReactNode } from 'react';
import useUser from '~/hooks/useUser';

export default function SignedOut({ children }: { children?: ReactNode }) {
	const { signedIn } = useUser();
	return <>{!signedIn ? children : null}</>;
}
