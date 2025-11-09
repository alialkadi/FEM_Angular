import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRequestReviewComponent } from './service-request-review.component';

describe('ServiceRequestReviewComponent', () => {
  let component: ServiceRequestReviewComponent;
  let fixture: ComponentFixture<ServiceRequestReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceRequestReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceRequestReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
