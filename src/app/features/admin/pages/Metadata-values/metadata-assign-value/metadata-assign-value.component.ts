import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataValuesService } from '../../../Services/metadata-values.service';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';
import { MetadataDataType } from '../../../../Models/MetadataDataType';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-metadata-assign-value',
  templateUrl: './metadata-assign-value.component.html',
  styleUrls: ['./metadata-assign-value.component.scss']
})
export class MetadataAssignValueComponent implements OnInit {

  attributeId!: number;
  attributeName = '';

  values: any[] = [];
  editingId: number | null = null;

  mode: 'single' | 'bulk' = 'single';

  singleForm!: FormGroup;
  bulkForm!: FormGroup;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private valuesService: MetadataValuesService,
    private attributeService: MetadataAttributeService,
    private router: Router,
    private toast: ToastService
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
    this.loadValues();
  }

  // ------------------------------
  // LOAD ATTRIBUTE
  // ------------------------------
  private loadAttribute() {
    this.attributeService.getById(this.attributeId).subscribe(res => {
      if (!res || res.dataType !== MetadataDataType.Select) {
        this.toast.show('Invalid metadata attribute', 'error');
        this.router.navigate(['/admin/dashboard/metadata']);
        return;
      }
      this.toast.show("Metadata Fetched Successfully", "success")
      this.attributeName = res.name;
    });
  }

  // ------------------------------
  // LOAD VALUES
  // ------------------------------
  loadValues() {
    this.loading = true;
    this.valuesService.getByAttribute(this.attributeId).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          this.loading = false;
          return;
        }
        this.values = res.data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load metadata values', 'error');
        this.loading = false;
      }
    });
  }

  // ------------------------------
  // CREATE SINGLE
  // ------------------------------
  normalizeSingleValue() {
    const value = this.singleForm.get('value')?.value || '';
    this.singleForm.patchValue({
      value: value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')
    });
  }

  submitSingle() {
    if (this.singleForm.invalid) return;

    this.loading = true;
    this.valuesService.create(this.attributeId, this.singleForm.value).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          this.loading = false;
          return;
        }

        this.toast.show(res.message, 'success');
        this.singleForm.reset({ sortOrder: 0 });
        this.loadValues();
      },
      error: () => {
        this.toast.show('Create failed', 'error');
        this.loading = false;
      }
    });
  }

  // ------------------------------
  // CREATE BULK
  // ------------------------------
  submitBulk() {
    const raw = this.bulkForm.value.values;
    const start = this.bulkForm.value.startSortOrder;

    const values = raw
      .split('\n')
      .map((x: string) => x.trim())
      .filter(Boolean)
      .map((line: string, i: number) => ({
        value: line.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        displayName: line,
        sortOrder: start + i
      }));

    if (!values.length) {
      this.toast.show('No valid values found', 'error');
      return;
    }

    this.loading = true;
    this.valuesService.createBulk(this.attributeId, { values }).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          this.loading = false;
          return;
        }

        this.toast.show(res.message, 'success');
        this.bulkForm.reset({ startSortOrder: 0 });
        this.loadValues();
      },
      error: () => {
        this.toast.show('Bulk create failed', 'error');
        this.loading = false;
      }
    });
  }

  // ------------------------------
  // EDIT
  // ------------------------------
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
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          this.loading = false;
          return;
        }

        Object.assign(v, v._edit);
        delete v._edit;
        this.editingId = null;
        this.toast.show(res.message, 'success');
        this.loading = false;
      },
      error: () => {
        this.toast.show('Update failed', 'error');
        this.loading = false;
      }
    });
  }

  // ------------------------------
  // DELETE
  // ------------------------------
  deleteValue(v: any) {
    if (!confirm('Delete this value?')) return;

    this.valuesService.delete(v.id).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }

        this.toast.show(res.message, 'success');
        this.loadValues();
      },
      error: () => {
        this.toast.show('Delete failed', 'error');
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/dashboard/metadata']);
  }
}
