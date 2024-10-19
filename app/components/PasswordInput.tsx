import { type InputHTMLAttributes, useState, useEffect, useRef } from 'react';
import VisibilitySvg from '../assets/visibility-material-icon.svg';
import { forwardRef } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps & { containerClassName: string; iconClassName: string; }>(
    ({ name, containerClassName, className, iconClassName, ...props }, ref) => {
        const parentRef = ref;
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const [isSmallScreen, setIsSmallScreen] = useState(false);
        const divRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleResize = () => {
                setIsSmallScreen(window.innerWidth <= 640); // Adjust the breakpoint as needed
            };

            handleResize(); // Check initial screen size
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return (
            <div
                ref={divRef}
                className={containerClassName}
            >
                <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    name={name ?? 'password'}
                    ref={parentRef}
                    className={className}
                    {...props}
                />
                <button
                    type='button'
                    className={iconClassName}
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
