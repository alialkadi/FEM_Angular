import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeeComponent } from './create-fee.component';

describe('CreateFeeComponent', () => {
  let component: CreateFeeComponent;
  let fixture: ComponentFixture<CreateFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
