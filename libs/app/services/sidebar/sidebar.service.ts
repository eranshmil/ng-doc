import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Injectable} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {filter, pluck, startWith, switchMap} from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
@UntilDestroy()
export class NgDocSidebarService {
	readonly breakpoints: string[] = [Breakpoints.XSmall, Breakpoints.Small];
	protected readonly observer: Observable<boolean>;
	protected readonly visible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(protected readonly breakpointObserver: BreakpointObserver, protected readonly router: Router) {
		this.observer = this.breakpointObserver.observe(this.breakpoints).pipe(pluck('matches'), untilDestroyed(this));

		this.router.events
			.pipe(
				filter((event: Event) => event instanceof NavigationEnd && this.visible.value),
				startWith(null),
			)
			.subscribe(() => this.hide());
	}

	isCollapsable(): Observable<boolean> {
		return this.observer;
	}

	visibilityChanges(): Observable<boolean> {
		return this.visible.asObservable();
	}

	isExpanded(): Observable<boolean> {
		return this.isCollapsable().pipe(
			switchMap((isCollapsable: boolean) => (isCollapsable ? this.visibilityChanges() : of(false))),
		);
	}

	show(): void {
		!this.visible.value && this.visible.next(true);
	}

	hide(): void {
		this.visible.value && this.visible.next(false);
	}

	toggle(): void {
		this.visible.value ? this.hide() : this.show();
	}
}
