import {
	DocBlock,
	DocParamBlock,
	TSDocConfiguration,
	TSDocParser,
	TSDocTagDefinition,
	TSDocTagSyntaxKind
} from '@microsoft/tsdoc';
import {ParserContext} from '@microsoft/tsdoc/lib/parser/ParserContext';
import {asArray} from '@ng-doc/core';
import {JSDoc, JSDocableNode} from 'ts-morph';

import {TsDocFormatter} from '../engine/ts-doc-formatter';

/**
 *
 * @param node
 * @param section
 * @param customTag
 */
export function extractDocs(node: JSDocableNode, customTag?: string): string {
	const jsDocs: JSDoc[] = asArray(node.getJsDocs()[0]);
	const parser: TSDocParser = new TSDocParser(getTsDocConfiguration());

	return jsDocs.map((doc: JSDoc) => {
		const context: ParserContext = parser.parseString(doc.getText());

		return customTag
			? TsDocFormatter.renderDocNodes(context.docComment.customBlocks.filter((block: DocBlock) => block.blockTag.tagName === customTag))
			: TsDocFormatter.renderDocNode(context.docComment.summarySection);
	}).join('');
}

/**
 *
 * @param node
 * @param paramName
 */
export function extractParameterDocs(node: JSDocableNode, paramName: string): string {
	const jsDocs: JSDoc[] = asArray(node.getJsDocs()[0]);
	const parser: TSDocParser = new TSDocParser(getTsDocConfiguration());

	return jsDocs.map((doc: JSDoc) => {
		const context: ParserContext = parser.parseString(doc.getText());
		const paramBlock: DocParamBlock | undefined = context.docComment.params.tryGetBlockByName(paramName);

		return paramBlock ? TsDocFormatter.renderDocNode(paramBlock.content) : '';
	}).join('');
}

/**
 *
 */
function getTsDocConfiguration(): TSDocConfiguration {
	const customTags: TSDocTagDefinition[] = [
		new TSDocTagDefinition({tagName: '@usageNotes', syntaxKind: TSDocTagSyntaxKind.BlockTag, allowMultiple: false})
	];

	const configuration: TSDocConfiguration = new TSDocConfiguration();

	customTags.forEach((tag: TSDocTagDefinition) => configuration.addTagDefinition(tag));

	return configuration;
}