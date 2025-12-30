import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataAttributeListComponent } from './metadata-attribute-list.component';

describe('MetadataAttributeListComponent', () => {
  let component: MetadataAttributeListComponent;
  let fixture: ComponentFixture<MetadataAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataAttributeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetadataAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
