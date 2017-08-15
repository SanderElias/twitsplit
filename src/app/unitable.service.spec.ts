import { TestBed, inject } from '@angular/core/testing';

import { UnitableService } from './unitable.service';

describe('UnitableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitableService]
    });
  });

  it('should be created', inject([UnitableService], (service: UnitableService) => {
    expect(service).toBeTruthy();
  }));
});
