import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealFormComponent } from './meal-form.component';

describe('MealFormComponent', () => {
	let component: MealFormComponent;
	let fixture: ComponentFixture<MealFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MealFormComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MealFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
