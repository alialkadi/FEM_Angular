import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServiceRequestComponent } from './admin-service-request.component';

describe('AdminServiceRequestComponent', () => {
  let component: AdminServiceRequestComponent;
  let fixture: ComponentFixture<AdminServiceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminServiceRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminServiceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
