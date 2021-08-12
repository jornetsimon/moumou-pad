import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgForRepeatModule } from 'ng-for-repeat';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxVibrationModule } from 'ngx-vibration';

const components: Array<any> = [];

const modules = [
	CommonModule,
	FormsModule,
	RouterModule,
	ReactiveFormsModule,
	HttpClientModule,
	FlexLayoutModule,
	NgForRepeatModule,
	NgxVibrationModule,
	MatTooltipModule,
	MatCardModule,
	MatRippleModule,
	MatButtonModule,
	MatIconModule,
	MatFormFieldModule,
	MatInputModule,
	MatDividerModule,
	MatChipsModule,
	MatDialogModule,
	MatAutocompleteModule,
	MatOptionModule,
	MatProgressSpinnerModule,
	MatCheckboxModule,
	MatMenuModule,
	DragDropModule,
];

@NgModule({
	declarations: [...components],
	imports: [...modules],
	exports: [...components, ...modules],
})
export class SharedModule {
	constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
		this.matIconRegistry.addSvgIcon(
			`jow`,
			this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/jow-logo.svg`)
		);
	}
}
