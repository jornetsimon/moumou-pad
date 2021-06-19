import { TestBed } from '@angular/core/testing';

import { JowService } from './jow.service';

describe('JowService', () => {
	let service: JowService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(JowService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
