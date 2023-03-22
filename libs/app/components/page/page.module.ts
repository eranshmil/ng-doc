import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgDocPageMapModule} from '@ng-doc/app/components/toc';
import {NgDocSanitizeHtmlModule} from '@ng-doc/app/pipes/sanitize-html';
import {
	NgDocBlockquoteProcessorModule,
	NgDocCodeProcessorModule,
	NgDocDemoProcessorModule,
	NgDocIconProcessorModule,
	NgDocLinkProcessorModule,
	NgDocPlaygroundProcessorModule,
	NgDocTooltipProcessorModule,
} from '@ng-doc/app/processors';
import {
	NgDocBooleanControlModule,
	NgDocNumberControlModule,
	NgDocStringControlModule,
	NgDocTypeAliasControlModule,
} from '@ng-doc/app/type-controls';
import {
	NgDocButtonIconModule,
	NgDocButtonModule,
	NgDocIconModule,
	NgDocMediaQueryModule,
	NgDocTextModule,
	NgDocTooltipModule,
} from '@ng-doc/ui-kit';

import {NgDocPageComponent} from './page.component';

@NgModule({
	declarations: [NgDocPageComponent],
	imports: [
		/* TypeControls */
		NgDocBooleanControlModule,
		NgDocNumberControlModule,
		NgDocStringControlModule,
		NgDocTypeAliasControlModule,

		CommonModule,
		NgDocDemoProcessorModule,
		NgDocLinkProcessorModule,
		NgDocCodeProcessorModule,
		NgDocBlockquoteProcessorModule,
		NgDocSanitizeHtmlModule,
		NgDocIconProcessorModule,
		NgDocPageMapModule,
		NgDocMediaQueryModule,
		NgDocTooltipProcessorModule,
		NgDocButtonIconModule,
		NgDocIconModule,
		NgDocTooltipModule,
		NgDocPlaygroundProcessorModule,
		RouterLink,
		NgDocButtonModule,
		NgDocTextModule,
	],
	exports: [NgDocPageComponent],
})
export class NgDocPageModule {}
