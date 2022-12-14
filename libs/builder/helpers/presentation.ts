import {MethodDeclaration, ParameterDeclaration, TypeAliasDeclaration, VariableDeclaration} from 'ts-morph';

import {displayType} from './typescript';

/**
 *
 * @param method
 */
export function methodPresentation(method: MethodDeclaration): string {
	const parameters: string = method.getParameters().map(parameterPresentation).join(', ');

	return `function ${method.getName()}(${parameters}): ${displayType(method.getReturnType())};`;
}

/**
 *
 * @param typeAlias
 */
export function typeAliasPresentation(typeAlias: TypeAliasDeclaration): string {
	return typeAlias.getText().replace('export', '').trim();
}

/**
 *
 * @param variable
 */
export function variablePresentation(variable: VariableDeclaration): string {
	return `${variable.getVariableStatement()?.getDeclarationKind() ?? 'const'} ${variable.getName()}: ${displayType(
		variable.getType(),
	)};`;
}

/**
 *
 * @param parameter
 */
function parameterPresentation(parameter: ParameterDeclaration): string {
	return `${parameter.getName()}${parameter.hasQuestionToken() ? '?' : ''}: ${displayType(parameter.getType())}${
		parameter.getInitializer() ? ` = ${parameter.getInitializer()}` : ''
	}`.trim();
}
