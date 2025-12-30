import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  FormGroup,
  FormBuilder,
  FormArray
} from '@angular/forms';

import {
  MetadataTargetType,
  MetadataAssignmentSaveRequest
} from '../../../../Models/MetadataTargetType';

import { MetadataAttribute } from '../../../../Models/MetadataAttribute';
import { MetadataDataType } from '../../../../Models/MetadataDataType';

import { MetadataAssignmentService } from '../../../Services/metadata-assignment.service';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';

@Component({
  selector: 'app-attribute-assignment',
  templateUrl: './attribute-assignment.component.html',
  styleUrls: ['./attribute-assignment.component.scss']
})
export class AttributeAssignmentComponent
  implements OnInit, OnChanges {

  // ================= INPUTS =================
  @Input() targetType!: MetadataTargetType;
  @Input() targetId!: number;

  // ================= STATE =================
  attributes: MetadataAttribute[] = [];
  assignedValues: any[] = [];

  form!: FormGroup;

  loading = false;
  saving = false;

  MetadataDataType = MetadataDataType;

  constructor(
    private fb: FormBuilder,
    private attributesService: MetadataAttributeService,
    private assignmentService: MetadataAssignmentService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.form = this.fb.group({
      attributes: this.fb.array([])
    });

    this.loadData();
  }

  // ================= INPUT CHANGES =================
  ngOnChanges(changes: SimpleChanges): void {

    // Ignore first change (handled by ngOnInit)
    const targetChanged =
      (changes['targetId'] && !changes['targetId'].firstChange) ||
      (changes['targetType'] && !changes['targetType'].firstChange);

    if (targetChanged) {
      this.resetAndReload();
    }
  }

  // ================= FORM ARRAY =================
  get attributesForm(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  // ================= RESET =================
  private resetAndReload(): void {
    this.loading = true;

    this.attributes = [];
    this.assignedValues = [];

    this.attributesForm.clear();
    this.form.reset();

    this.loadData();
  }

  // ================= LOAD DATA =================
  private loadData(): void {
    if (!this.targetId || !this.targetType) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.attributesService.getAll().subscribe({
      next: attrRes => {
        this.attributes = attrRes.data;

        this.assignmentService
          .getByTarget(this.targetType, this.targetId)
          .subscribe({
            next: assignRes => {
              this.assignedValues = assignRes.data ?? [];
              this.buildForm();
              this.loading = false;
            },
            error: () => {
              this.buildForm();
              this.loading = false;
            }
          });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ================= BUILD FORM =================
  private buildForm(): void {
    this.attributesForm.clear();

    for (const attr of this.attributes) {

      const assigned = this.assignedValues
        .find(x => x.metadataAttributeId === attr.id);

      const group: any = {
        metadataAttributeId: [attr.id]
      };

      if (attr.dataType === MetadataDataType.Select) {
        group.valueIds = [
          attr.allowMultipleValues
            ? assigned?.valueIds ?? []
            : assigned?.valueIds?.[0] ?? null
        ];
        group.valueText = [null];
      } else {
        group.valueText = [assigned?.valueText ?? ''];
        group.valueIds = [null];
      }

      this.attributesForm.push(this.fb.group(group));
    }
  }

  // ================= SAVE =================
  submit(): void {
    if (this.form.invalid) return;

    const normalizedAttributes = this.form.value.attributes
      .filter((x: any) => this.hasValue(x))
      .map((x: any) => ({
        metadataAttributeId: x.metadataAttributeId,
        valueIds: Array.isArray(x.valueIds) ? x.valueIds : null,
        valueText:
          x.valueText !== null && x.valueText !== undefined
            ? String(x.valueText)
            : null
      }));

    const payload: MetadataAssignmentSaveRequest = {
      targetType: this.targetType,
      targetId: this.targetId,
      attributes: normalizedAttributes
    };

    this.saving = true;

    this.assignmentService.save(payload).subscribe({
      next: () => {
        this.saving = false;
        // reload to reflect saved state
        this.resetAndReload();
      },
      error: () => {
        this.saving = false;
      }
    });
  }
toggleCheckbox(index: number, valueId: number): void {
  const control = this.attributesForm.at(index);
  const current = control.value.valueIds ?? [];

  if (current.includes(valueId)) {
    control.patchValue({
      valueIds: current.filter((x: number) => x !== valueId)
    });
  } else {
    control.patchValue({
      valueIds: [...current, valueId]
    });
  }
}
isChecked(index: number, valueId: number, isMulti: boolean): boolean {
  const control = this.attributesForm.at(index);
  if (!control) return false;

  const valueIds = control.value?.valueIds;

  return isMulti
    ? Array.isArray(valueIds) && valueIds.includes(valueId)
    : valueIds === valueId;
}

onCheckboxChange(
  index: number,
  valueId: number,
  isMulti: boolean,
  event: Event
): void {
  const control = this.attributesForm.at(index);
  if (!control) return;

  const checked = (event.target as HTMLInputElement)?.checked;

  if (isMulti) {
    const current: number[] = control.value?.valueIds ?? [];

    control.patchValue({
      valueIds: checked
        ? [...current, valueId]
        : current.filter(x => x !== valueId)
    });
  } else {
    control.patchValue({
      valueIds: checked ? valueId : null
    });
  }
}

  // ================= HELPERS =================
  private hasValue(item: any): boolean {
    return (
      (Array.isArray(item.valueIds) && item.valueIds.length > 0) ||
      (!Array.isArray(item.valueIds) && item.valueIds !== null) ||
      (item.valueText && item.valueText.toString().trim() !== '')
    );
  }
}
