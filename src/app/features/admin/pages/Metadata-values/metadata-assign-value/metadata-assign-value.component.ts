import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataValuesService } from '../../../Services/metadata-values.service';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';
import { MetadataDataType } from '../../../../Models/MetadataDataType';

@Component({
  selector: 'app-metadata-assign-value',
  templateUrl: './metadata-assign-value.component.html',
  styleUrls: ['./metadata-assign-value.component.scss']
})
export class MetadataAssignValueComponent implements OnInit {

  // ===============================
  // ATTRIBUTE
  // ===============================
  attributeId!: number;
  attributeName = '';

  // ===============================
  // VALUES DATA
  // ===============================
  values: any[] = [];
  editingId: number | null = null;

  // ===============================
  // CREATE MODES
  // ===============================
  mode: 'single' | 'bulk' = 'single';

  singleForm!: FormGroup;
  bulkForm!: FormGroup;

  // ===============================
  // UI STATE
  // ===============================
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private valuesService: MetadataValuesService,
    private attributeService: MetadataAttributeService,
    private router: Router
  ) {}

  // ===============================
  // INIT
  // ===============================
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
    this.loadValues();
  }

  // ===============================
  // LOAD ATTRIBUTE (GUARD)
  // ===============================
  private loadAttribute() {
    this.attributeService.getById(this.attributeId).subscribe(attr => {
      if (!attr || attr.dataType !== MetadataDataType.Select) {
        this.router.navigate(['/admin/dashboard/metadata']);
        return;
      }
      this.attributeName = attr.name;
    });
  }

  // ===============================
  // LOAD VALUES
  // ===============================
  loadValues() {
    this.loading = true;
    this.valuesService.getByAttribute(this.attributeId).subscribe({
      next: res => {
        this.values = res.data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to load values';
        this.loading = false;
      }
    });
  }

  // ===============================
  // CREATE SINGLE
  // ===============================
  normalizeSingleValue() {
    const value = this.singleForm.get('value')?.value || '';
    this.singleForm.patchValue({
      value: value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
    });
  }

  submitSingle() {
    if (this.singleForm.invalid) return;

    this.loading = true;
    this.valuesService.create(this.attributeId, this.singleForm.value).subscribe({
      next: () => {
        this.singleForm.reset({ sortOrder: 0 });
        this.loadValues();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Create failed';
        this.loading = false;
      }
    });
  }

  // ===============================
  // CREATE BULK
  // ===============================
  submitBulk() {
    const raw = this.bulkForm.value.values;
    const start = this.bulkForm.value.startSortOrder;

    const values = raw
      .split('\n')
      .map((x:string) => x.trim())
      .filter(Boolean)
      .map((line: string, i: number) => ({
        value: line
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_'),
        displayName: line,
        sortOrder: start + i
      }));

    if (!values.length) {
      this.errorMessage = 'No valid values found';
      return;
    }

    this.loading = true;
    this.valuesService.createBulk(this.attributeId, { values }).subscribe({
      next: () => {
        this.bulkForm.reset({ startSortOrder: 0 });
        this.loadValues();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Bulk create failed';
        this.loading = false;
      }
    });
  }

  // ===============================
  // EDIT EXISTING VALUE
  // ===============================
  startEdit(v: any) {
    this.editingId = v.id;
    v._edit = {
      displayName: v.displayName,
      sortOrder: v.sortOrder,
      isActive: v.isActive
    };
  }

  cancelEdit(v: any) {
    delete v._edit;
    this.editingId = null;
  }

  saveEdit(v: any) {
    this.loading = true;
    this.valuesService.update(v.id, v._edit).subscribe({
      next: () => {
        Object.assign(v, v._edit);
        delete v._edit;
        this.editingId = null;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Update failed';
        this.loading = false;
      }
    });
  }

  // ===============================
  // DELETE
  // ===============================
  deleteValue(v: any) {
    if (!confirm('Delete this value?')) return;

    this.valuesService.delete(v.id).subscribe({
      next: () => this.loadValues(),
      error: err => {
        this.errorMessage = err?.error?.message || 'Delete failed';
      }
    });
  }

  // ===============================
  // NAVIGATION
  // ===============================
  cancel() {
    this.router.navigate(['/admin/dashboard/metadata']);
  }
}
