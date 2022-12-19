import {asArray, isPresent, NgDocPage} from '@ng-doc/core';
import * as fs from 'fs';
import * as path from 'path';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {SourceFile} from 'ts-morph';

import {isDependencyEntity, isPlaygroundEntity, marked, slash, uniqueName} from '../../helpers';
import {NgDocBuiltOutput} from '../../interfaces';
import {NgDocPageEnv, NgDocPageModuleEnv} from '../../templates-env';
import {NgDocActions} from '../actions';
import {NgDocRenderer} from '../renderer';
import {PAGE_DEPENDENCIES_NAME, PLAYGROUND_NAME, RENDERED_PAGE_NAME} from '../variables';
import {NgDocEntity} from './abstractions/entity';
import {NgDocNavigationEntity} from './abstractions/navigation.entity';
import {NgDocCategoryEntity} from './category.entity';
import {NgDocDependenciesEntity} from './dependencies.entity';
import {NgDocPlaygroundEntity} from './playground.entity';

export class NgDocPageEntity extends NgDocNavigationEntity<NgDocPage> {
	override moduleName: string = uniqueName(`NgDocGeneratedPageModule`);
	componentName: string = uniqueName(`NgDocGeneratedPageComponent`);
	override moduleFileName: string = `${uniqueName('ng-doc-page')}.module.ts`;

	override parent?: NgDocCategoryEntity;

	override get route(): string {
		const folderName: string = path.basename(path.dirname(this.sourceFile.getFilePath()));

		return this.target?.route ?? folderName;
	}

	/**
	 * Returns full url from the root
	 *
	 * @type {string}
	 */
	get url(): string {
		return `${this.parent ? this.parent.url + '/' : ''}${this.route}`;
	}

	override get isRoot(): boolean {
		return !this.target?.category;
	}

	override get title(): string {
		return this.target?.title ?? '';
	}

	override get canBeBuilt(): boolean {
		return (
			!this.target ||
			!this.context.options.ngDoc?.tag ||
			!this.target.onlyForTags ||
			asArray(this.target.onlyForTags).includes(this.context.options.ngDoc?.tag)
		);
	}

	override get order(): number | undefined {
		return this.target?.order;
	}

	override get keywords(): string[] {
		return [...asArray(this.target?.keyword)].map((k: string) => `*${k}`);
	}

	get mdPath(): string {
		return path.join(this.sourceFileFolder, this.target?.mdFile ?? '');
	}

	get builtPagePath(): string {
		return slash(path.relative(this.context.context.workspaceRoot, path.join(this.folderPath, RENDERED_PAGE_NAME)));
	}

	override get buildCandidates(): NgDocEntity[] {
		return this.parentEntities;
	}

	get assetsFolder(): string {
		return path.relative(this.context.context.workspaceRoot, path.join(this.folderPath, 'assets'));
	}

	get pageDependenciesFile(): string | undefined {
		const dependenciesPath: string = path.join(this.sourceFileFolder, PAGE_DEPENDENCIES_NAME);

		return fs.existsSync(dependenciesPath) ? dependenciesPath : undefined;
	}

	get pageDependenciesImport(): string | undefined {
		return this.pageDependenciesFile ? slash(this.pageDependenciesFile.replace(/.ts$/, '')) : undefined;
	}

	get componentsAssets(): string | undefined {
		const dependencies: NgDocDependenciesEntity | undefined = asArray(this.children.values()).filter(
			isDependencyEntity,
		)[0];

		return dependencies && dependencies.assets.length ? dependencies.componentAssetsImport : undefined;
	}

	get playground(): NgDocPlaygroundEntity | undefined {
		return this.children.find(isPlaygroundEntity);
	}

	get playgroundFile(): string | undefined {
		const playgroundPath: string = path.join(this.sourceFileFolder, PLAYGROUND_NAME);

		return fs.existsSync(playgroundPath) ? playgroundPath : undefined;
	}

	get pagePlaygroundImport(): string | undefined {
		return this.playgroundFile ? slash(this.playgroundFile.replace(/.ts$/, '')) : undefined;
	}

	override update(): Observable<void> {
		return super.update().pipe(
			tap(() => {
				if (!isPresent(this.target?.mdFile) || !fs.existsSync(this.mdPath)) {
					throw new Error(
						`Failed to load ${this.sourceFile.getFilePath()}. Make sure that you define mdFile property correctly and .md file exists.`,
					);
				}

				if (!this.title) {
					throw new Error(
						`Failed to load ${this.sourceFile.getFilePath()}. Make sure that you have a title property.`,
					);
				}

				this.parent = this.getParentFromCategory();
			}),
			catchError((error: unknown) => {
				this.readyToBuild = false;
				this.context.context.logger.error(`\n\n${String(error)}`);

				return of(void 0);
			}),
		);
	}

	protected override build(): Observable<NgDocBuiltOutput[]> {
		return this.isReadyForBuild ? forkJoin([this.buildPage(), this.buildModule()]) : of([]);
	}

	private buildModule(): Observable<NgDocBuiltOutput> {
		if (this.target) {
			const renderer: NgDocRenderer<NgDocPageModuleEnv> = new NgDocRenderer<NgDocPageModuleEnv>(this.builder, {
				page: this,
			});

			return renderer
				.render('./page.module.ts.nunj')
				.pipe(map((output: string) => ({content: output, filePath: this.modulePath})));
		}
		return of();
	}

	private buildPage(): Observable<NgDocBuiltOutput> {
		this.dependencies.clear();

		if (this.target) {
			this.dependencies.add(this.mdPath);
			this.pageDependenciesFile && this.dependencies.add(this.pageDependenciesFile);
			this.playgroundFile && this.dependencies.add(this.playgroundFile);
			this.playground?.sourceFile
				?.getReferencedSourceFiles()
				.forEach((sourceFile: SourceFile) => sourceFile.refreshFromFileSystemSync());

			const renderer: NgDocRenderer<NgDocPageEnv> = new NgDocRenderer<NgDocPageEnv>(
				this.builder,
				{
					NgDocPage: this.target,
					NgDocActions: new NgDocActions(this),
				},
				this.dependencies,
			);

			return renderer.render(this.target?.mdFile, {scope: this.sourceFileFolder}).pipe(
				map((markdown: string) => marked(markdown)),
				map((output: string) => ({content: output, filePath: this.builtPagePath})),
			);
		}
		return of();
	}
}
