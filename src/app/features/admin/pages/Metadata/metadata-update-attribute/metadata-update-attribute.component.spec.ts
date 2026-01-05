import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataUpdateAttributeComponent } from './metadata-update-attribute.component';

describe('MetadataUpdateAttributeComponent', () => {
  let component: MetadataUpdateAttributeComponent;
  let fixture: ComponentFixture<MetadataUpdateAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataUpdateAttributeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetadataUpdateAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
