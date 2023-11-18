import { animate, style, transition, trigger } from '@angular/animations';
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NG_DOC_NIGHT_THEME } from '@ng-doc/app/constants';
import { NgDocTheme } from '@ng-doc/app/interfaces';
import { NgDocThemeService } from '@ng-doc/app/services';
import {
	NgDocButtonIconComponent,
	NgDocIconComponent,
	NgDocSmoothResizeComponent,
	NgDocTooltipDirective,
} from '@ng-doc/ui-kit';

interface ToggleTheme {
	name: string;
	theme: NgDocTheme | 'auto' | undefined;
}

@Component({
	animations: [
		trigger('switchIcon', [
			transition(
				':enter',
				[
					style({ transform: 'translateX({{from}})', position: 'absolute', opacity: 0 }),
					animate(
						'225ms cubic-bezier(0.4,0.0,0.2,1)',
						style({ transform: 'translateX(0%)', position: 'absolute', opacity: 1 }),
					),
				],
				{ params: { from: '-100%' } },
			),
			transition(
				':leave',
				[
					style({ transform: 'translateX(0%)', position: 'absolute', opacity: 1 }),
					animate(
						'225ms cubic-bezier(0.4,0.0,0.2,1)',
						style({ transform: 'translateX({{to}})', position: 'absolute', opacity: 0 }),
					),
				],
				{ params: { to: '-100%' } },
			),
		]),
	],
	selector: 'ng-doc-theme-toggle',
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		NgDocButtonIconComponent,
		NgDocTooltipDirective,
		NgIf,
		NgDocIconComponent,
		NgDocSmoothResizeComponent,
	],
})
export class NgDocThemeToggleComponent {
	protected readonly themes: ToggleTheme[] = [
		{ name: 'Auto', theme: 'auto' },
		{ name: 'Light', theme: undefined },
		{ name: 'Dark', theme: NG_DOC_NIGHT_THEME },
	];

	constructor(protected readonly themeService: NgDocThemeService) {}

	get currentTheme(): ToggleTheme {
		if (this.themeService.isAutoThemeEnabled) {
			return this.themes[0];
		}

		const theme = this.themeService.currentTheme;

		return this.themes.find(({ theme: t }) => t === theme) ?? this.themes[0];
	}

	get nextTheme(): ToggleTheme {
		if (this.themeService.isAutoThemeEnabled) {
			return this.themes[1];
		}

		const index = this.themes.findIndex(({ theme }) => theme === this.themeService.currentTheme);

		return this.themes[(index + 1) % this.themes.length];
	}

	toggleTheme(): void {
		const { theme } = this.nextTheme;

		if (theme === 'auto') {
			this.themeService.enableAutoTheme(undefined, NG_DOC_NIGHT_THEME);
		} else {
			this.themeService.set(theme?.id);
		}
	}
}
