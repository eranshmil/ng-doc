import {NgDocTocItem} from '@ng-doc/app/interfaces';

/**
 *
 * @param container
 * @param headings
 */
export function generateToc(container: HTMLElement, headings: string[] = ['h1', 'h2', 'h3', 'h4']): NgDocTocItem[] {
	const headingElements: HTMLHeadingElement[] = Array.from(
		container.querySelectorAll<HTMLHeadingElement>(headings.join(', ')),
	);

	return headingElements.reduce((map: NgDocTocItem[], heading: HTMLHeadingElement, i: number) => {
		const headingLevel: number = levelFromTagName(heading);
		const previousItem: NgDocTocItem | undefined = map[i - 1];
		const level: number = !previousItem
			? 1
			: levelFromTagName(previousItem.element) < headingLevel
			? previousItem.level + 1
			: levelFromTagName(previousItem.element) > headingLevel
			? previousItem.level - 1
			: previousItem.level;
		const anchor: HTMLAnchorElement | null = heading.querySelector<HTMLAnchorElement>('a.ng-doc-header-link');

		if (anchor) {
			map.push({
				title: heading.textContent?.trim() ?? '',
				element: heading,
				path: anchor.pathname + anchor.hash,
				level,
			});
		}

		return map;
	}, []);
}

/**
 *
 * @param heading
 */
function levelFromTagName(heading: HTMLHeadingElement): number {
	return Number(heading.tagName.replace(/[a-zA-Z]*/g, '') || 1);
}
