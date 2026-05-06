import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserServiceQouteRequestsComponent } from './user-service-qoute-requests.component';

describe('UserServiceQouteRequestsComponent', () => {
  let component: UserServiceQouteRequestsComponent;
  let fixture: ComponentFixture<UserServiceQouteRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserServiceQouteRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserServiceQouteRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
