import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboradNavComponent } from './dashborad-nav.component';

describe('DashboradNavComponent', () => {
  let component: DashboradNavComponent;
  let fixture: ComponentFixture<DashboradNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboradNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboradNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
