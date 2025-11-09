import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExplorerOptionBComponent } from './service-explorer-option-b.component';

describe('ServiceExplorerOptionBComponent', () => {
  let component: ServiceExplorerOptionBComponent;
  let fixture: ComponentFixture<ServiceExplorerOptionBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceExplorerOptionBComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceExplorerOptionBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
