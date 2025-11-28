import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianRequestsComponent } from './technician-requests.component';

describe('TechnicianRequestsComponent', () => {
  let component: TechnicianRequestsComponent;
  let fixture: ComponentFixture<TechnicianRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechnicianRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicianRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
