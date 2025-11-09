import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExplorerOptionCComponent } from './service-explorer-option-c.component';

describe('ServiceExplorerOptionCComponent', () => {
  let component: ServiceExplorerOptionCComponent;
  let fixture: ComponentFixture<ServiceExplorerOptionCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceExplorerOptionCComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceExplorerOptionCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
