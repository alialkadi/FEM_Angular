import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCateogyTypeComponent } from './edit-cateogy-type.component';

describe('EditCateogyTypeComponent', () => {
  let component: EditCateogyTypeComponent;
  let fixture: ComponentFixture<EditCateogyTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCateogyTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCateogyTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
