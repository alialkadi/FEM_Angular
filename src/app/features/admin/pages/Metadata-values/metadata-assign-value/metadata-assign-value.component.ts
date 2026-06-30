import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataValuesService } from '../../../Services/metadata-values.service';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';
import { MetadataDataType } from '../../../../Models/MetadataDataType';
import { ToastService } from '../../../../../shared/Services/toast.service';
import { ConfirmDialogComponent } from '../../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-metadata-assign-value',
  templateUrl: './metadata-assign-value.component.html',
  styleUrls: ['./metadata-assign-value.component.scss'],
})
export class MetadataAssignValueComponent implements OnInit {
  attributeId!: number;
  attributeName = '';

  values: any[] = [];
  editingId: number | null = null;

  form!: FormGroup;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private valuesService: MetadataValuesService,
    private attributeService: MetadataAttributeService,
    private router: Router,
    private toast: ToastService,
    private confirmDialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.attributeId = Number(this.route.snapshot.paramMap.get('attributeId'));

    // ✅ ONE form
    this.form = this.fb.group({
      // user can paste 1 or many lines
      rawValues: ['', Validators.required],

      // used only when single line OR as a base for bulk auto-sort
      displayName: [''],
      sortOrder: [0, Validators.required],

      // used when multiple lines (optional but helpful)
      startSortOrder: [0, Validators.required],
    });

    this.loadAttribute();
    this.loadValues();
  }

  // ------------------------------
  // LOAD ATTRIBUTE
  // ------------------------------
  private loadAttribute() {
    this.attributeService.getById(this.attributeId).subscribe((res) => {
      if (!res || res.dataType !== MetadataDataType.Select) {
        this.toast.show('Invalid metadata attribute', 'error');
        this.router.navigate(['/admin/dashboard/metadata']);
        return;
      }
      this.attributeName = res.name;
    });
  }

  // ------------------------------
  // LOAD VALUES
  // ------------------------------
  loadValues() {
    this.loading = true;
    this.valuesService.getByAttribute(this.attributeId).subscribe({
      next: (res) => {
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
      },
    });
  }

  // ------------------------------
  // Helpers
  // ------------------------------
  private normalizeTechnicalValue(input: string): string {
    return (input || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, ''); // trim underscores
  }

  private splitLines(raw: string): string[] {
    return (raw || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // Optional: auto-normalize when user leaves textarea (single line only)
  normalizeIfSingle(): void {
    const lines = this.splitLines(this.form.get('rawValues')?.value);
    if (lines.length === 1) {
      const normalized = this.normalizeTechnicalValue(lines[0]);
      this.form.patchValue({ rawValues: normalized });
    }
  }

  // ------------------------------
  // SUBMIT (Single or Bulk)
  // ------------------------------
  submit(): void {
    if (this.form.invalid || this.loading) return;

    const raw = this.form.get('rawValues')?.value as string;
    const lines = this.splitLines(raw);

    if (!lines.length) {
      this.toast.show('No valid values found', 'error');
      return;
    }

    this.loading = true;

    // ✅ SINGLE
    if (lines.length === 1) {
      const technical = this.normalizeTechnicalValue(lines[0]);

      const payload = {
        value: technical,
        displayName: (this.form.get('displayName')?.value || '').trim(),
        sortOrder: Number(this.form.get('sortOrder')?.value ?? 0),
      };

      this.valuesService.create(this.attributeId, payload).subscribe({
        next: (res) => {
          if (!res.success) {
            this.toast.show(res.message, 'error');
            this.loading = false;
            return;
          }
          this.toast.show(res.message, 'success');
          this.form.reset({ sortOrder: 0, startSortOrder: 0, displayName: '' });
          this.loadValues();
        },
        error: () => {
          this.toast.show('Create failed', 'error');
          this.loading = false;
        },
      });

      return;
    }

    // ✅ BULK (2+ lines)
    const start = Number(this.form.get('startSortOrder')?.value ?? 0);

    const bulkValues = lines.map((line, i) => ({
      value: this.normalizeTechnicalValue(line),
      displayName: line, // keep human label
      sortOrder: start + i,
    }));

    // guard: avoid empty normalized values
    const validBulk = bulkValues.filter((x) => !!x.value);
    if (!validBulk.length) {
      this.toast.show('No valid values found after normalization', 'error');
      this.loading = false;
      return;
    }

    this.valuesService
      .createBulk(this.attributeId, { values: validBulk })
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.toast.show(res.message, 'error');
            this.loading = false;
            return;
          }
          this.toast.show(res.message, 'success');
          this.form.reset({ sortOrder: 0, startSortOrder: 0, displayName: '' });
          this.loadValues();
        },
        error: () => {
          this.toast.show('Bulk create failed', 'error');
          this.loading = false;
        },
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
      isActive: v.isActive,
    };
  }

  cancelEdit(v: any) {
    delete v._edit;
    this.editingId = null;
  }

  saveEdit(v: any) {
    this.loading = true;
    this.valuesService.update(v.id, v._edit).subscribe({
      next: (res) => {
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
        this.loadValues();
      },
      error: () => {
        this.toast.show('Update failed', 'error');
        this.loading = false;
      },
    });
  }

  // ------------------------------
  // DELETE
  // ------------------------------
  deleteValue(v: any) {
    const confirmRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: `350px`,
      data: { message: `Are you sure you want to delete "${v.value}"` },
    });
    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.valuesService.delete(v.id).subscribe({
          next: (res) => {
            if (!res.success) {
              this.toast.show(res.message, 'error');
              return;
            }
            this.toast.show(res.message, 'success');
            this.loadValues();
          },
          error: (err) => {
            this.toast.show(err.error.message ?? 'Delete failed', 'error');
          },
        });
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/dashboard/metadata']);
  }

  // UI helper for template (show/hide bulk-only fields)
  get lineCount(): number {
    return this.splitLines(this.form?.get('rawValues')?.value || '').length;
  }
}
