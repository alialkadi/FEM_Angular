import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExplorerOptionAComponent } from './service-explorer-option-a.component';

describe('ServiceExplorerOptionAComponent', () => {
  let component: ServiceExplorerOptionAComponent;
  let fixture: ComponentFixture<ServiceExplorerOptionAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceExplorerOptionAComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceExplorerOptionAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
