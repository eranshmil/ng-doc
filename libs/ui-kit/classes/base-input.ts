import {Directive, ElementRef, HostBinding, Renderer2} from '@angular/core';
import {FlControl, FlControlHost} from 'flex-controls';

@Directive()
export abstract class NgDocBaseInput<T> extends FlControl<T> {
	protected constructor(
		public elementRef: ElementRef<HTMLInputElement>,
		protected renderer: Renderer2,
		protected override host?: FlControlHost<T>,
	) {
		super(host);
	}

	@HostBinding('class')
	get hostClasses(): string {
		return 'ng-doc-input';
	}

	get placeholder(): string {
		return this.elementRef.nativeElement.placeholder || '';
	}

	get isFocused(): boolean {
		return document.activeElement === this.elementRef.nativeElement;
	}

	get isReadonly(): boolean {
		return this.elementRef.nativeElement.readOnly;
	}

	get value(): string {
		return this.elementRef.nativeElement.value;
	}

	focus(): void {
		this.elementRef.nativeElement.focus();
	}

	blink(): void {
		this.renderer.removeClass(this.elementRef.nativeElement, '-blink');
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		this.elementRef.nativeElement.offsetWidth;
		this.renderer.addClass(this.elementRef.nativeElement, '-blink');
	}
}
