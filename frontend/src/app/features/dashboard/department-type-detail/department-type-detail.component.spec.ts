import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentTypeDetailComponent } from './department-type-detail.component';

describe('DepartmentTypeDetailComponent', () => {
  let component: DepartmentTypeDetailComponent;
  let fixture: ComponentFixture<DepartmentTypeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentTypeDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepartmentTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
