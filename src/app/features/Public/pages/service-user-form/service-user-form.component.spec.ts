import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceUserFormComponent } from './service-user-form.component';

describe('ServiceUserFormComponent', () => {
  let component: ServiceUserFormComponent;
  let fixture: ComponentFixture<ServiceUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceUserFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
