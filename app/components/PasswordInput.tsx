import { type InputHTMLAttributes, useState } from 'react';
import VisibilitySvg from '../assets/visibility-material-icon.svg';
import { forwardRef } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ name, ...props }, ref) => {
		const parentRef = ref;
		const [isPasswordVisible, setIsPasswordVisible] = useState(false);
		return (
			<div className='flex flex-row gap-2'>
				<input
					type={isPasswordVisible ? 'text' : 'password'}
					name={name ?? 'password'}
					ref={parentRef}
					{...props}
				/>
				<button
					type='button'
					className={`bg-transparent p-2 rounded hover:bg-neutral-700 ${
						isPasswordVisible ? 'bg-neutral-700' : 'bg-transparent'
					}`}
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
