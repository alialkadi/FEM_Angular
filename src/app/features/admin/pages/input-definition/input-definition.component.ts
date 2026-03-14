import { ToastService } from './../../../../shared/Services/toast.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  InputDefinitionDto,
  PricingInputBehavior,
} from '../../../Models/InputDefinitionDto';
import { MetadataDataType } from '../../../Models/MetadataTargetType';
import { InputDefinitionService } from '../../Services/input-definition.service';
import {
  CreateInputValueRequest,
  InputValueDto,
} from '../../../Models/InputValueDto.model';
import { InputValueService } from '../../Services/input-value.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';
import { error } from 'console';

@Component({
  selector: 'app-input-definition',
  templateUrl: './input-definition.component.html',
  styleUrls: ['./input-definition.component.scss'],
})
export class InputDefinitionComponent implements OnInit {
  definitions: InputDefinitionDto[] = [];
  form!: FormGroup;

  loading = false;
  submitting = false;
  MetadataDataType = MetadataDataType;
  PricingInputBehavior = PricingInputBehavior;
  dataTypeOptions = [
    { value: MetadataDataType.Number, label: 'Number' },
    { value: MetadataDataType.Select, label: 'Select' },
    { value: MetadataDataType.Boolean, label: 'Boolean' },
    { value: MetadataDataType.Text, label: 'Text' },
  ];
  // ================= VALUES =================
  selectedDefinition?: InputDefinitionDto;
  values: InputValueDto[] = [];
  showValues = false;

  valueForm!: FormGroup;
  loadingValues = false;
  creatingValue = false;

  constructor(
    private fb: FormBuilder,
    private service: InputDefinitionService,
    private valueService: InputValueService,
    private confirmDialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDefinitions();
    this.valueForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[a-z_]+$')]],
      displayName: ['', Validators.required],
      sortOrder: [0, Validators.required],
    });
  }
  openValues(def: InputDefinitionDto): void {
    this.selectedDefinition = def;
    this.showValues = true;
    this.loadValues();
  }

  loadValues(): void {
    if (!this.selectedDefinition) return;

    this.loadingValues = true;

    this.valueService
      .getByInputDefinition(this.selectedDefinition.id)
      .subscribe((res) => {
        if (res.success) {
          this.values = res.data;
          console.log(res);
        }
        this.loadingValues = false;
      });
  }

  closeValues(): void {
    this.showValues = false;
    this.values = [];
    this.selectedDefinition = undefined;
  }
  createValue(): void {
    if (this.valueForm.invalid || !this.selectedDefinition) {
      this.valueForm.markAllAsTouched();
      return;
    }

    this.creatingValue = true;

    const payload: CreateInputValueRequest = {
      inputDefinitionId: this.selectedDefinition.id,
      code: this.valueForm.value.code.trim().toLowerCase(),
      displayName: this.valueForm.value.displayName.trim(),
      sortOrder: this.valueForm.value.sortOrder,
    };

    this.valueService.create(payload).subscribe((res) => {
      if (res.success) {
        this.values.push(res.data);
        this.valueForm.reset({ sortOrder: 0 });
      }
      console.log(res);
      this.creatingValue = false;
    });
  }
  toggleActive(v: InputValueDto): void {
    this.valueService
      .update(v.id, {
        displayName: v.displayName,
        sortOrder: v.sortOrder,
        isActive: !v.isActive,
      })
      .subscribe((res) => {
        if (res.success) {
          v.isActive = !v.isActive;
        }
      });
  }

  deleteValue(v: InputValueDto): void {
    if (!confirm(`Delete value "${v.displayName}"?`)) return;

    this.valueService.delete(v.id).subscribe((res) => {
      if (res.success) {
        this.values = this.values.filter((x) => x.id !== v.id);
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[a-z_]+$')]],
      label: ['', Validators.required],
      dataType: [null, Validators.required],
      pricingBehavior: [{ value: PricingInputBehavior.None, disabled: true }],
      allowDecimal: [false],
      min: [null],
      max: [null],
    });

    this.form.get('dataType')!.valueChanges.subscribe((dt) => {
      this.applyRules(dt);
    });
  }

  private applyRules(dt: MetadataDataType): void {
    const behavior = this.form.get('pricingBehavior')!;
    behavior.enable();

    this.form.patchValue({ allowDecimal: false, min: null, max: null });

    switch (dt) {
      case MetadataDataType.Number:
        behavior.setValue(PricingInputBehavior.Dimensional);
        break;

      case MetadataDataType.Select:
        behavior.setValue(PricingInputBehavior.Rate);
        break;

      default:
        behavior.setValue(PricingInputBehavior.None);
        behavior.disable();
    }
  }

  loadDefinitions(): void {
    this.loading = true;
    this.service.getAll().subscribe((res) => {
      if (res.success) {
        this.definitions = res.data;
        console.log(res);
      }
      this.loading = false;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      ...this.form.getRawValue(),
      code: this.form.value.code.trim().toLowerCase(),
    };
    console.log(payload);
    this.service.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.definitions.unshift(res.data);
          this.form.reset({
            pricingBehavior: PricingInputBehavior.None,
            allowDecimal: false,
            min: null,
            max: null,
          });
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.submitting = false; // ✅ RESET
      },
    });
  }

  delete(item: InputDefinitionDto): void {
    // if (!confirm(`Delete input "${item.label}"?`)) return;
    const confirmRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: `350px`,
      data: { message: `Are you sure you want to delete "${item.label}"` },
    });
    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.delete(item.id).subscribe({
          next: (res) => {
            //  this.definitions = this.definitions.filter((x) => x.id !== item.id);
            this.toast.show(res.message);
            this.loadDefinitions();
          },
          error: (err) => {
            this.toast.show(err.error.message);
            console.log(err);
          },
        });
        // this.service.delete(item.id).subscribe((res) => {
        //   if (res.success) {
        //     this.definitions = this.definitions.filter((x) => x.id !== item.id);
        //     this.toast.show(res.message);
        //     this.loadDefinitions();
        //   }
        // });
      }
    });
  }
}
