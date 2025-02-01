import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRootModule } from '@taiga-ui/core';
import { HeaderComponent } from '../app/header/header.component';
import { MealIdeasComponent } from '../app/meal-ideas/meal-ideas.component';

@Component({
    selector: 'cb-shell',
    imports: [RouterOutlet, TuiRootModule, HeaderComponent, MealIdeasComponent],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {}
