import { Component, OnInit } from '@angular/core';
import { MetadataAttribute } from '../../../../Models/MetadataAttribute';
import { MetadataDataType } from '../../../../Models/MetadataDataType';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-metadata-attribute-list',
  templateUrl: './metadata-attribute-list.component.html',
  styleUrls: ['./metadata-attribute-list.component.scss']
})
export class MetadataAttributeListComponent implements OnInit {

  attributes: MetadataAttribute[] =[];
  loading = false;

  // filters (UI only for now)
  search = '';
  dataType?: MetadataDataType;
  activeOnly = true;

  readonly MetadataDataType = MetadataDataType;

  constructor(
    private attributeService: MetadataAttributeService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAttributes();
  }

  // ================= LOAD =================
  loadAttributes(): void {
    this.loading = true;

    this.attributeService.getAll().subscribe({
      next: (res) => {
        this.attributes = res.data.data;
        this.toast.show(res.message, 'success');
        this.loading = false;
      },
      error: (err) => {
        this.toast.show(
          err?.error?.message ?? 'Failed to load metadata attributes.',
          'error'
        );
        this.loading = false;
      }
    });
  }

  // ================= DELETE (SINGLE) =================
  delete(attr: MetadataAttribute): void {
    if (!confirm(`Delete metadata attribute "${attr.name}"?`)) return;

    this.attributeService.delete(attr.id).subscribe({
      next: (res) => {
        this.toast.show(res.message, 'success');
        this.attributes = this.attributes.filter(a => a.id !== attr.id);
      },
      error: (err) => {
        this.toast.show(
          err?.error?.message ?? 'Failed to delete metadata attribute.',
          'error'
        );
      }
    });
  }

  // ================= TOGGLE ACTIVE =================
  toggleStatus(attr: MetadataAttribute): void {
    this.attributeService
      .toggleActive(attr.id, !attr.isActive)
      .subscribe({
        next: () => {
          attr.isActive = !attr.isActive;
          this.toast.show(
            `Attribute ${attr.isActive ? 'activated' : 'deactivated'} successfully`,
            'success'
          );
        },
        error: (err) => {
          this.toast.show(
            err?.error?.message ?? 'Failed to update attribute status.',
            'error'
          );
        }
      });
  }

  // ========= Helpers =========

  getDisplayName(attr: MetadataAttribute): string {
    return attr.displayName ?? attr.name;
  }

  getDataTypeLabel(type: MetadataDataType): string {
    switch (type) {
      case MetadataDataType.Select: return 'SELECT';
      case MetadataDataType.Number: return 'NUMBER';
      case MetadataDataType.Boolean: return 'BOOLEAN';
      case MetadataDataType.Text: return 'TEXT';
      default: return 'UNKNOWN';
    }
  }

  isSelect(attr: MetadataAttribute): boolean {
    return attr.dataType === MetadataDataType.Select;
  }
}
