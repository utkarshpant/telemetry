import { ReactNode } from 'react';
import useUser from '~/hooks/useUser';

type SignedInProps = {
	/**
	 * The children to be rendered if the user is signed in.
	 */
	children?: ReactNode;
	/**
	 * If provided, this is the userId/array of userId's of the user(s) who should be signed in and can see the children rendered. This ensures that User A cannot see User B's information, even though both are signed in.
	 */
	contextOwner?: number | string | number[] | string[];
};

export default function SignedIn({
	children,
	contextOwner,
}: {
	children?: ReactNode;
	contextOwner?: number | number[] | string | string[];
}) {
	const { signedIn, user } = useUser();
	if (!contextOwner) {
		return <>{signedIn ? children : null}</>;
	} else {
		if (Array.isArray(contextOwner)) {
			return <>{signedIn && contextOwner.some((id) => id === user.id) ? children : null}</>;
		} else {
			return <>{signedIn && contextOwner === user.id ? children : null}</>;
		}
	}
}
