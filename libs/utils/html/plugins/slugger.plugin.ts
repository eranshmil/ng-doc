import {NgDocEntityAnchor, NgDocHeading} from '@ng-doc/core';
import GithubSlugger from 'github-slugger';
import {Element, Root} from 'hast';
import {hasProperty} from 'hast-util-has-property';
import {headingRank} from 'hast-util-heading-rank';
import {toString} from 'hast-util-to-string';
import {visit} from 'unist-util-visit';

/**
 *
 * @param tree
 * @param addAnchor
 * @param headings
 */
export default function sluggerPlugin(addAnchor: (anchor: NgDocEntityAnchor) => void, headings?: NgDocHeading[]) {
	headings = headings || ['h1', 'h2', 'h3', 'h4'];
	const slugger = new GithubSlugger();

	return (tree: Root) => {
		slugger.reset();

		visit(tree, 'element', (node: Element) => {
			const isHeading =
				headingRank(node) && !hasProperty(node, 'id') && headings?.includes(node.tagName.toLowerCase() as NgDocHeading);
			const isSlugAttribute = hasProperty(node, 'dataslug');

			const dataToSlug: string | undefined = isHeading
				? toString(node)
				: isSlugAttribute
				? String(node.properties?.['dataslug'])
				: undefined;

			if (dataToSlug) {
				if (node.properties) {
					const slug: string = slugger.slug(dataToSlug);
					const slugTitle: string | undefined = node.properties?.['dataslugtitle']
						? String(node.properties['dataslugtitle'])
						: undefined;

					node.properties['id'] = slug;

					addAnchor({
						anchor: slug,
						title: slugTitle || dataToSlug,
						type:
							(isHeading && node.properties?.['dataslugtype'] !== 'member') ||
							(isSlugAttribute && node.properties?.['dataslugtype'] === 'heading')
								? 'heading'
								: 'member',
					});
				}
			}
		});
	};
}
