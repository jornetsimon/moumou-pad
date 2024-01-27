import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRootModule } from '@taiga-ui/core';
import { HeaderComponent } from '../app/header/header.component';

@Component({
	selector: 'cb-shell',
	standalone: true,
	imports: [RouterOutlet, TuiRootModule, HeaderComponent],
	templateUrl: './shell.component.html',
	styleUrl: './shell.component.scss',
})
export class ShellComponent {}
