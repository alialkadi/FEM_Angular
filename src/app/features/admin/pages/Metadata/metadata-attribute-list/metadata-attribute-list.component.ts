import { Component, OnInit } from '@angular/core';
import { MetadataAttribute } from '../../../../Models/MetadataAttribute';
import { MetadataDataType } from '../../../../Models/MetadataDataType';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';

@Component({
  selector: 'app-metadata-attribute-list',
  templateUrl: './metadata-attribute-list.component.html',
  styleUrls: ['./metadata-attribute-list.component.scss']
})
export class MetadataAttributeListComponent implements OnInit {

  attributes: MetadataAttribute[] = [];
  loading = false;

  // filters (UI only for now)
  search = '';
  dataType?: MetadataDataType;
  activeOnly = true;

  readonly MetadataDataType = MetadataDataType;

  constructor(
    private attributeService: MetadataAttributeService
  ) {}

  ngOnInit(): void {
    this.loadAttributes();
  }

  loadAttributes(): void {
    this.loading = true;

    this.attributeService.getAll().subscribe({
      next: (res) => {
        this.attributes = res.data;
        this.loading = false;
        console.log(res.data)
        console.log('Metadata Attributes:', res);
      },
      error: err => {
        console.error('Failed to load metadata attributes', err);
        this.loading = false;
      }
    });
  }

  // ========= Helpers (SAFE) =========

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

  toggleStatus(attr: MetadataAttribute): void {
    this.attributeService
      .toggleActive(attr.id, !attr.isActive)
      .subscribe(() => {
        attr.isActive = !attr.isActive;
      });
  }
}
