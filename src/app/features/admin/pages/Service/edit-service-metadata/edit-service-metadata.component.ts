import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MetadataAssignmentItemRequest,
  MetadataTargetType,
} from '../../../../Models/MetadataTargetType';
import { ServiceService } from '../../../Services/service-service.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-edit-service-metadata',
  templateUrl: './edit-service-metadata.component.html',
  styleUrls: ['./edit-service-metadata.component.scss'],
})
export class EditServiceMetadataComponent implements OnInit {
  serviceId!: number;
  metadataTargetType = MetadataTargetType.Service;
  metadataPayload: MetadataAssignmentItemRequest[] = [];
  saving = false;
  serviceName?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));

    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.serviceName = res.data.name;
        }
      },
    });
  }

  onMetadataChange(items: MetadataAssignmentItemRequest[]): void {
    this.metadataPayload = items;
  }

  onSubmit(): void {
    this.saving = true;

    this.serviceService
      .updateServiceMetadata(this.serviceId, {
        metadata: this.metadataPayload,
      })
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.toast.show(
              res.message ?? 'Metadata updated successfully',
              'success',
            );
            this.router.navigate(['/admin/dashboard/Services']);
          } else {
            this.toast.show(res.message ?? 'Metadata update failed', 'error');
          }
        },
        error: (err) => {
          this.saving = false;
          this.toast.show(
            err.error?.message ?? 'Metadata update failed',
            'error',
          );
        },
      });
  }
}
