import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataValuesService } from '../../../Services/metadata-values.service';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';

@Component({
  selector: 'app-metadata-assign-value',
  templateUrl: './metadata-assign-value.component.html',
  styleUrls: ['./metadata-assign-value.component.scss']
})
export class MetadataAssignValueComponent implements OnInit {

  attributeId!: number;
  attributeName = '';

  mode: 'single' | 'bulk' = 'single';

  singleForm!: FormGroup;
  bulkForm!: FormGroup;

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private valuesService: MetadataValuesService,
    private attributeService: MetadataAttributeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.attributeId = Number(this.route.snapshot.paramMap.get('attributeId'));

    this.singleForm = this.fb.group({
      value: ['', Validators.required],
      displayName: [''],
      sortOrder: [0, Validators.required]
    });

    this.bulkForm = this.fb.group({
      values: ['', Validators.required],
      startSortOrder: [0, Validators.required]
    });

    this.loadAttribute();
  }

  private loadAttribute() {
    this.attributeService.getById(this.attributeId).subscribe(res => {
      if (res) {
        this.attributeName = res.name;
      }
    });
  }

  normalizeSingleValue() {
    const value = this.singleForm.get('value')?.value || '';
    this.singleForm.patchValue({
      value: value.toLowerCase().trim().replace(/\s+/g, '_')
    });
  }

  submit() {
    this.errorMessage = '';
    this.mode === 'single'
      ? this.submitSingle()
      : this.submitBulk();
  }

  private submitSingle() {
    if (this.singleForm.invalid) {
      this.singleForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.valuesService.create(this.attributeId, this.singleForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/dashboard/metadata']);
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Failed to create value';
        }
      });
  }

  private submitBulk() {
    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }

    const values = this.parseBulkValues();

    if (!values.length) {
      this.errorMessage = 'Please enter at least one value';
      return;
    }

    this.loading = true;

    this.valuesService.createBulk(this.attributeId, { values })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/dashboard/metadata']);
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Bulk creation failed';
        }
      });
  }

  private parseBulkValues() {
    const raw = this.bulkForm.value.values as string;
    const startOrder = this.bulkForm.value.startSortOrder;

    return raw
      .split('\n')
      .map(x => x.trim())
      .filter(x => x.length > 0)
      .map((line, index) => ({
        value: line.toLowerCase().replace(/\s+/g, '_'),
        displayName: line,
        sortOrder: startOrder + index
      }));
  }

  cancel() {
    this.router.navigate(['/admin/dashboard/metadata']);
  }
}
