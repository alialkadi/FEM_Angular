import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartOptionListComponent } from './part-option-list.component';

describe('PartOptionListComponent', () => {
  let component: PartOptionListComponent;
  let fixture: ComponentFixture<PartOptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartOptionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartOptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
