import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesPage } from './leaves';

describe('Leaves', () => {
  let component: LeavesPage;
  let fixture: ComponentFixture<LeavesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
