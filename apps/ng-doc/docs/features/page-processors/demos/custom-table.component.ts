import {Component} from '@angular/core';

@Component({
  selector: 'custom-table',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host ::ng-deep table {
        border: 1px solid red;
      }
    `,
  ],
})
export class CustomTableComponent {}
