function getChipClasses(variant) {
	switch (variant) {
		case 'info':
			return 'bg-amber-500 text-white';
		case 'alert':
			return 'bg-red-500 text-white';
        case 'announcement':
            return 'bg-cyan-900 text-white';
		default:
			return 'bg-gray-300 text-gray-800';
	}
}

type ChipProps = {
    content: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
    variant?: 'info' | 'alert' | 'announcement';
    icon?: string;
}

export function Chip({ content, onClick, variant, icon }: ChipProps) {
	return (
		<div
			role='button'
			tabIndex={0}
			className={`flex items-center gap-2 justify-between px-3 py-1 rounded-full cursor-pointer text-sm font-medium w-auto no-underline ${getChipClasses(
				variant
			)}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if ((e.key === 'Enter' || e.key === ' ') && onClick) {
					onClick(e);
				}
			}}
		>
			{icon ? (
				<img
					src={icon}
					alt='Chip icon'
					className='h-4 w-4'
				/>
			) : null}
			<p>{content}</p>
		</div>
	);
}
