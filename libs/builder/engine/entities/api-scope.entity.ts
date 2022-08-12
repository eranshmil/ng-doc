import {asArray} from '@ng-doc/core';
import * as glob from 'glob';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Project, SourceFile} from 'ts-morph';

import {isNotExcludedPath, isPageEntity, uniqueName} from '../../helpers';
import {NgDocApiScope, NgDocBuilderContext, NgDocBuiltOutput} from '../../interfaces';
import {NgDocApiScopeModuleEnv} from '../../templates-env/api-scope.module.env';
import {NgDocEntityStore} from '../entity-store';
import {isSupportedDeclaration} from '../functions/is-supported-declaration';
import {NgDocRenderer} from '../renderer';
import {NgDocSupportedDeclarations} from '../types/supported-declarations';
import {NgDocEntity} from './abstractions/entity';
import {NgDocNavigationEntity} from './abstractions/navigation.entity';
import {NgDocApiEntity} from './api.entity';
import {NgDocApiPageEntity} from './api-page.entity';
import {NgDocPageEntity} from './page.entity';

export class NgDocApiScopeEntity extends NgDocNavigationEntity<NgDocApiScope> {
	override moduleName: string = uniqueName(`NgDocGeneratedApiScopeCategoryModule`);
	override readonly isNavigable: boolean = false;
	protected override readyToBuild: boolean = true;

	constructor(
		override readonly project: Project,
		override readonly sourceFile: SourceFile,
		protected override readonly context: NgDocBuilderContext,
		protected override readonly entityStore: NgDocEntityStore,
		override parent: NgDocApiEntity,
		override target: NgDocApiScope,
	) {
		super(project, sourceFile, context, entityStore, target.route);
	}

	override get isRoot(): boolean {
		// always false, api scopes are not rooted
		return false;
	}

	override get route(): string {
		return this.target.route;
	}

	/**
	 * Returns full url from the root
	 *
	 * @type {string}
	 */
	get url(): string {
		return `${this.parent ? this.parent.url + '/' : ''}${this.route}`;
	}

	override get order(): number | undefined {
		return this.target?.order;
	}

	get pages(): NgDocPageEntity[] {
		return asArray(this.children.values()).filter(isPageEntity);
	}

	override get moduleFileName(): string {
		return `ng-doc-scope.module.ts`;
	}

	override get title(): string {
		return this.target.name;
	}

	override get buildCandidates(): NgDocEntity[] {
		return this.childEntities;
	}

	protected override update(): Observable<void> {
		asArray(this.target.include).forEach((include: string) =>
			asArray(
				new Set(
					this.project
						.addSourceFilesAtPaths(
							glob
								.sync(include)
								.filter((p: string) => isNotExcludedPath(p, asArray(this.target.exclude))),
						)
						.map((sourceFile: SourceFile) => asArray(sourceFile.getExportedDeclarations().values()))
						.flat(2),
				),
			)
				.filter(isSupportedDeclaration)
				.forEach((declaration: NgDocSupportedDeclarations) => {
					const name: string | undefined = declaration.getName();

					if (name) {
						new NgDocApiPageEntity(
							this.project,
							declaration.getSourceFile(),
							this.context,
							this.entityStore,
							this,
							name,
						);
					}
				}),
		);

		return of(void 0);
	}

	protected override build(): Observable<NgDocBuiltOutput[]> {
		return this.isReadyToBuild ? forkJoin([this.buildModule()]) : of([]);
	}

	private buildModule(): Observable<NgDocBuiltOutput> {
		if (this.target) {
			const renderer: NgDocRenderer<NgDocApiScopeModuleEnv> = new NgDocRenderer<NgDocApiScopeModuleEnv>({
				scope: this,
			});

			return renderer
				.render('api-scope.module.ts.nunj')
				.pipe(map((output: string) => ({output, filePath: this.modulePath})));
		}
		return of();
	}

	override destroy(): void {
		this.children.forEach((child: NgDocEntity) => child.destroy());

		super.destroy();
	}
}