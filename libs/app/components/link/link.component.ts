import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
	selector: 'ng-doc-link',
	templateUrl: './link.component.html',
	styleUrls: ['./link.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDocLinkComponent {
	@Input()
	path: string = '';
}
