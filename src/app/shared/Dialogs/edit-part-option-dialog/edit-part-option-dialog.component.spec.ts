import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPartOptionDialogComponent } from './edit-part-option-dialog.component';

describe('EditPartOptionDialogComponent', () => {
  let component: EditPartOptionDialogComponent;
  let fixture: ComponentFixture<EditPartOptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPartOptionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPartOptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
