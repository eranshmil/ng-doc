import {BuilderContext} from '@angular-devkit/architect';
import {NgDocStyleType} from '@ng-doc/core';

import {NgDocSchema} from './schema';

export interface NgDocBuilderContext {
	tsConfig: string;
	options: NgDocSchema;
	context: BuilderContext;
	inlineStyleLanguage: NgDocStyleType;
	pagesPaths: string[];
	assetsPath: string;
	buildPath: string;
	apiPath: string;
	modulesPath: string;
}
