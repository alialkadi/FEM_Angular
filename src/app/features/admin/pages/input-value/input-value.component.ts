import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputValueService } from '../../Services/input-value.service';
import {
  InputValueDto,
  CreateInputValueRequest,
} from '../../../Models/InputValueDto.model';

@Component({
  selector: 'app-input-values',
  templateUrl: './input-value.component.html',
  styleUrls: ['./input-value.component.scss'],
})
export class InputValueComponent implements OnInit {
  @Input() inputDefinitionId!: number;

  values: InputValueDto[] = [];
  form!: FormGroup;

  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private valueService: InputValueService,
  ) {}

  ngOnInit(): void {
    if (!this.inputDefinitionId) return;

    this.initForm();
    this.loadValues();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[a-z_]+$')]],
      displayName: ['', Validators.required],
      sortOrder: [0, Validators.required],
    });
  }

  loadValues(): void {
    this.loading = true;

    this.valueService.getByInputDefinition(this.inputDefinitionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.values = res.data;
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload: CreateInputValueRequest = {
      inputDefinitionId: this.inputDefinitionId,
      code: this.form.value.code.trim().toLowerCase(),
      displayName: this.form.value.displayName.trim(),
      sortOrder: this.form.value.sortOrder,
    };

    this.valueService.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.values.push(res.data);
          this.form.reset({ sortOrder: 0 });
        }
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }

  toggleActive(value: InputValueDto): void {
    this.valueService
      .update(value.id, {
        displayName: value.displayName,
        sortOrder: value.sortOrder,
        isActive: !value.isActive,
      })
      .subscribe((res) => {
        if (res.success) {
          value.isActive = !value.isActive;
        }
      });
  }

  delete(value: InputValueDto): void {
    if (!confirm(`Delete value "${value.displayName}"?`)) return;

    this.valueService.delete(value.id).subscribe((res) => {
      if (res.success) {
        this.values = this.values.filter((v) => v.id !== value.id);
      }
    });
  }
}
