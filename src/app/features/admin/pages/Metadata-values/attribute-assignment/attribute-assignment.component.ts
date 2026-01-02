import {
  Component,
  Input,
  Output,
  EventEmitter,
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
  MetadataAssignmentItemRequest,
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
  @Input() targetId!: number; // 0 = create, >0 = edit

  // ================= OUTPUT =================
  @Output() metadataChange =
    new EventEmitter<MetadataAssignmentItemRequest[]>();

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
    this.attributes = [];
    this.assignedValues = [];
    this.attributesForm.clear();
    this.form.reset();
    this.loadData();
  }

  // ================= LOAD DATA =================
  private loadData(): void {
    this.loading = true;

    this.attributesService.getAll().subscribe({
      next: attrRes => {
        this.attributes = attrRes.data ?? [];

        // CREATE MODE → no assignments yet
        if (!this.targetId || this.targetId <= 0) {
          this.assignedValues = [];
          this.buildForm();
          this.loading = false;
          return;
        }

        // EDIT MODE → load assignments
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

      // SELECT
      if (attr.dataType === MetadataDataType.Select) {
        group.valueIds = [
          attr.allowMultipleValues
            ? assigned?.valueIds ?? []
            : assigned?.valueIds?.[0] ?? null
        ];
        group.valueText = [null];
      }
      // TEXT / NUMBER / BOOLEAN
      else {
        group.valueText = [assigned?.valueText ?? ''];
        group.valueIds = [null];
      }

      this.attributesForm.push(this.fb.group(group));
    }

    // Emit initial state (important for create mode)
    this.emitMetadata();
  }

  // ================= CHECKBOX HANDLING =================
  onCheckboxChange(
    index: number,
    valueId: number,
    isMulti: boolean,
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    const control = this.attributesForm.at(index);

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

    this.emitMetadata();
  }

  isChecked(index: number, valueId: number, isMulti: boolean): boolean {
    const valueIds = this.attributesForm.at(index)?.value?.valueIds;
    return isMulti
      ? Array.isArray(valueIds) && valueIds.includes(valueId)
      : valueIds === valueId;
  }

  // ================= EMIT METADATA =================
  private emitMetadata(): void {
    const normalized: MetadataAssignmentItemRequest[] =
      this.form.value.attributes
        .filter((x: any) => this.hasValue(x))
        .map((x: any) => ({
          metadataAttributeId: x.metadataAttributeId,
          valueIds: Array.isArray(x.valueIds) ? x.valueIds : null,
          valueText:
            x.valueText !== null && x.valueText !== undefined
              ? String(x.valueText)
              : null
        }));

    this.metadataChange.emit(normalized);
  }

  // ================= SAVE (EDIT MODE ONLY) =================
  submit(): void {
    if (!this.targetId || this.targetId <= 0) return;
    if (this.form.invalid) return;

    const payload: MetadataAssignmentSaveRequest = {
      targetType: this.targetType,
      targetId: this.targetId,
      attributes: this.form.value.attributes
        .filter((x: any) => this.hasValue(x))
        .map((x: any) => ({
          metadataAttributeId: x.metadataAttributeId,
          valueIds: Array.isArray(x.valueIds) ? x.valueIds : null,
          valueText:
            x.valueText !== null && x.valueText !== undefined
              ? String(x.valueText)
              : null
        }))
    };

    this.saving = true;

    this.assignmentService.save(payload).subscribe({
      next: () => (this.saving = false),
      error: () => (this.saving = false)
    });
  }

  // ================= HELPERS =================
  private hasValue(item: any): boolean {
    return (
      (Array.isArray(item.valueIds) && item.valueIds.length > 0) ||
      (!Array.isArray(item.valueIds) && item.valueIds !== null) ||
      (item.valueText && item.valueText.toString().trim() !== '')
    );
  }

  trackByAttrId(_: number, attr: MetadataAttribute) {
    return attr.id;
  }

  getDataTypeLabel(type: MetadataDataType): string {
    switch (type) {
      case MetadataDataType.Select: return 'Select';
      case MetadataDataType.Number: return 'Number';
      case MetadataDataType.Boolean: return 'Boolean';
      case MetadataDataType.Text: return 'Text';
      default: return '';
    }
  }
}
