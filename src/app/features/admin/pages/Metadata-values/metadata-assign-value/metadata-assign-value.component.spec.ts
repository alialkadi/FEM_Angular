import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataAssignValueComponent } from './metadata-assign-value.component';

describe('MetadataAssignValueComponent', () => {
  let component: MetadataAssignValueComponent;
  let fixture: ComponentFixture<MetadataAssignValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataAssignValueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetadataAssignValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
