import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSelectionComponent } from './calendar-selection.component';

describe('CalendarSelectionComponent', () => {
	let component: CalendarSelectionComponent;
	let fixture: ComponentFixture<CalendarSelectionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CalendarSelectionComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CalendarSelectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
