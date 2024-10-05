import { type InputHTMLAttributes, useRef, useState } from 'react';
import VisibilitySvg from '../assets/visibility-material-icon.svg';
import { forwardRef } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ name, ...props }, ref) => {
		const inputRef = ref ?? useRef<HTMLInputElement>(null);
		const [isPasswordVisible, setIsPasswordVisible] = useState(false);
		const togglePasswordVisibility = () => {
			if (inputRef.current) {
				setIsPasswordVisible(!isPasswordVisible);
				inputRef.current.type = isPasswordVisible ? 'password' : 'text';
			}
		};

		return (
			<div className='flex flex-row gap-2'>
				<input
					type='password'
					name={name ?? 'password'}
					ref={inputRef}
					{...props}
				/>
				<button
					type='button'
					className='bg-transparent p-2 rounded hover:bg-neutral-700'
					onClick={togglePasswordVisibility}
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

export default PasswordInput;
