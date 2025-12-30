import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataCreateAttributeComponent } from './metadata-create-attribute.component';

describe('MetadataCreateAttributeComponent', () => {
  let component: MetadataCreateAttributeComponent;
  let fixture: ComponentFixture<MetadataCreateAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataCreateAttributeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetadataCreateAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
