import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const components: Array<any> = [];

const modules = [
	CommonModule,
	FormsModule,
	RouterModule,
	ReactiveFormsModule,
	AppRoutingModule,
	HttpClientModule,
	FlexLayoutModule,
	MatTooltipModule,
	MatCardModule,
	MatRippleModule,
	MatButtonModule,
	MatIconModule,
	MatFormFieldModule,
	MatInputModule,
	MatSnackBarModule,
];

@NgModule({
	declarations: [...components],
	imports: [...modules],
	exports: [...components, ...modules],
})
export class SharedModule {}
