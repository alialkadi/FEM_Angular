import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTypesComponent } from './category-types.component';

describe('CategoryTypesComponent', () => {
  let component: CategoryTypesComponent;
  let fixture: ComponentFixture<CategoryTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
