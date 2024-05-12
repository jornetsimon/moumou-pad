import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRootModule } from '@taiga-ui/core';
import { HeaderComponent } from '../app/header/header.component';
import { IdeasComponent } from '../app/ideas/ideas.component';

@Component({
	selector: 'cb-shell',
	standalone: true,
	imports: [RouterOutlet, TuiRootModule, HeaderComponent, IdeasComponent],
	templateUrl: './shell.component.html',
	styleUrl: './shell.component.less',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
