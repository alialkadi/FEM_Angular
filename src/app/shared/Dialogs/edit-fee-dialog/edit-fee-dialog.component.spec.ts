import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFeeDialogComponent } from './edit-fee-dialog.component';

describe('EditFeeDialogComponent', () => {
  let component: EditFeeDialogComponent;
  let fixture: ComponentFixture<EditFeeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditFeeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
