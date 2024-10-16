export function getLocaleDateString(date: Date | string) {
	let dateObj: Date;
	if (typeof date === 'string') {
		dateObj = new Date(date);
	} else {
		dateObj = date;
	}
	return dateObj.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function getLocaleTimeString(date: Date | string) {
	let dateObj: Date;
	if (typeof date === 'string') {
		dateObj = new Date(date);
	} else {
		dateObj = date;
	}
	return dateObj.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	});
}
