import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStructureDialogComponent } from './edit-structure-dialog.component';

describe('EditStructureDialogComponent', () => {
  let component: EditStructureDialogComponent;
  let fixture: ComponentFixture<EditStructureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditStructureDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditStructureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
