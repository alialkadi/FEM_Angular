import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetadataDataType } from '../../../../Models/MetadataDataType';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-metadata-create-attribute',
  templateUrl: './metadata-create-attribute.component.html',
  styleUrls: ['./metadata-create-attribute.component.scss']
})
export class MetadataCreateAttributeComponent implements OnInit {

  form!: FormGroup;
  loading = false;

  readonly MetadataDataType = MetadataDataType;

  readonly dataTypes = [
    { value: MetadataDataType.Select, label: 'SELECT' },
    { value: MetadataDataType.Number, label: 'NUMBER' },
    { value: MetadataDataType.Boolean, label: 'BOOLEAN' },
    { value: MetadataDataType.Text, label: 'TEXT' }
  ];

  constructor(
    private fb: FormBuilder,
    private service: MetadataAttributeService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  // -------------------------
  // Form Setup (CREATE ONLY)
  // -------------------------
  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      dataType: [MetadataDataType.Select, Validators.required],
      allowMultipleValues: [false],

      isFilterable: [true],
      isVisibleToUser: [true],
      affectsPricing: [false],
      isActive: [true]
    });

    // Enforce backend rule
    this.form.get('dataType')!.valueChanges.subscribe(type => {
      if (type !== MetadataDataType.Select) {
        this.form.get('allowMultipleValues')!.setValue(false);
        this.form.get('allowMultipleValues')!.disable();
      } else {
        this.form.get('allowMultipleValues')!.enable();
      }
    });
  }

  // -------------------------
  // Submit (CREATE ONLY)
  // -------------------------
  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const payload = {
      ...this.form.value,
      code: this.form.value.code.trim().toUpperCase()
    };

    this.service.create(payload).subscribe({
      next: (res) => {
        this.toast.show(res.message, 'success');
        this.loading = false;
        this.router.navigate(['/admin/dashboard/metadata']);
      },
      error: () => {
        this.toast.show('Failed to create metadata attribute.', 'error');
        this.loading = false;
      }
    });
  }
}
