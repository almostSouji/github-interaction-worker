export function truncate(text: string, len: number, splitChar = ' '): string {
	if (text.length <= len) return text;
	const words = text.split(splitChar);
	const res: string[] = [];
	for (const word of words) {
		const full = res.join(splitChar);
		if (full.length + word.length + 4 <= len) {
			res.push(word);
		}
	}

	const resText = res.join(splitChar);
	return resText.length === text.length ? resText : `${resText.trim()}...`;
}

export function trucateWord(text: string, len: number) {
	if (text.length <= len) return text;
	return `${text.slice(0, len - 3)}...`;
}
