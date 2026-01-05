import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataAttribute } from '../../../../Models/MetadataAttribute';
import { MetadataAttributeService } from '../../../Services/metadata-attribute.service';

@Component({
  selector: 'app-metadata-update-attribute',
  templateUrl: './metadata-update-attribute.component.html',
  styleUrl: './metadata-update-attribute.component.scss'
})
export class MetadataUpdateAttributeComponent {

  form!: FormGroup;
  attributeId!: number;
  attribute!: MetadataAttribute;
  loading = false;

  // ✅ UI messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: MetadataAttributeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.attributeId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadAttribute();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isFilterable: [false],
      isVisibleToUser: [true],
      affectsPricing: [false],
      isActive: [true]
    });
  }

  private loadAttribute(): void {
    this.loading = true;
    this.errorMessage = null;

    this.service.getById(this.attributeId).subscribe({
      next: attr => {
        this.attribute = attr;

        this.form.patchValue({
          name: attr.name,
          description: attr.description,
          isFilterable: attr.isFilterable,
          isVisibleToUser: attr.isVisibleToUser,
          affectsPricing: attr.affectsPricing,
          isActive: attr.isActive
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load metadata attribute.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.service.update(this.attributeId, this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Metadata attribute updated successfully.';

        // optional delay before navigation
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard/metadata']);
        }, 1000);
      },
      error: err => {
        this.loading = false;

        // ✅ Extract backend message safely
        this.errorMessage =
          err?.error?.message ??
          'Failed to update metadata attribute.';
      }
    });
  }
}
