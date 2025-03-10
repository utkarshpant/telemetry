import { type InputHTMLAttributes, useState, forwardRef } from 'react';
import VisibilitySvg from '../assets/visibility-material-icon.svg';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ name, ...props }, ref) => {
		const parentRef = ref;
		const [isPasswordVisible, setIsPasswordVisible] = useState(false);

		return (
			<div className='flex'>
				<input
					type={isPasswordVisible ? 'text' : 'password'}
					name={name ?? 'password'}
					ref={parentRef}
					className='p-2 rounded bg-neutral-200 dark:bg-stone-300 dark:bg-opacity-35 text-black dark:text-white flex-grow'
					{...props}
				/>
				<button
					type='button'
					className='min-h-10 min-w-10 p-2 rounded bg-stone-500 ml-2'
					onClick={() => {
						setIsPasswordVisible(!isPasswordVisible);
					}}
				>
					<img
						src={VisibilitySvg}
						alt='Show password'
					/>
				</button>
			</div>
		);
	}
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
