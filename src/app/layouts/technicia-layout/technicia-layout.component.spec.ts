import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechniciaLayoutComponent } from './technicia-layout.component';

describe('TechniciaLayoutComponent', () => {
  let component: TechniciaLayoutComponent;
  let fixture: ComponentFixture<TechniciaLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechniciaLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechniciaLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
