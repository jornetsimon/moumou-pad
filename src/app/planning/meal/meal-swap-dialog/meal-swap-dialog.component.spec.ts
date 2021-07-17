import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealSwapDialogComponent } from './meal-swap-dialog.component';

describe('MealSwapDialogComponent', () => {
	let component: MealSwapDialogComponent;
	let fixture: ComponentFixture<MealSwapDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MealSwapDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MealSwapDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
