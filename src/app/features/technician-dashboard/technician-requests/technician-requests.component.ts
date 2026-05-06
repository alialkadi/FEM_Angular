import { Component } from '@angular/core';
import {
  TechnicianAssignmentResponse,
  GetTechnicianAssignmentsApiResponse,
} from '../Models/assignment.model';
import { AssignmentsService } from '../Services/assignments.service';

@Component({
  selector: 'app-technician-requests',
  templateUrl: './technician-requests.component.html',
  styleUrl: './technician-requests.component.scss',
})
export class TechnicianRequestsComponent {
  assignments: TechnicianAssignmentResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(private _assignmentsService: AssignmentsService) {}

  ngOnInit(): void {
    this.getMyJobs();
  }
  get notCompletedAssignments(): TechnicianAssignmentResponse[] {
    return this.filteredAssignments.filter(
      (x) => (x.assignmentStatus || '').toLowerCase() !== 'completed',
    );
  }
  searchCustomer = '';
  searchPhone = '';
  searchDate = '';
  searchService = '';

  get filteredAssignments(): TechnicianAssignmentResponse[] {
    return this.assignments.filter((job) => {
      const customerMatch =
        !this.searchCustomer ||
        job.customerName
          ?.toLowerCase()
          .includes(this.searchCustomer.toLowerCase());

      const phoneMatch =
        !this.searchPhone ||
        job.customerPhone
          ?.toLowerCase()
          .includes(this.searchPhone.toLowerCase());

      const dateMatch =
        !this.searchDate ||
        new Date(job.assignedDate).toISOString().slice(0, 10) ===
          this.searchDate;

      const serviceMatch =
        !this.searchService ||
        job.services?.some((s) =>
          s.serviceName
            ?.toLowerCase()
            .includes(this.searchService.toLowerCase()),
        );

      return customerMatch && phoneMatch && dateMatch && serviceMatch;
    });
  }
  downloadNotCompletedReceipt(): void {
    const jobs = this.notCompletedAssignments;

    if (jobs.length === 0) {
      return;
    }

    const total = jobs.reduce((sum, job) => {
      const jobTotal = job.services.reduce(
        (s, service) => s + (service.calculatedTotal || 0),
        0,
      );
      return sum + jobTotal;
    }, 0);

    const rows = jobs
      .map(
        (job) => `
    <div class="receipt-card">
      <h3>Assignment #${job.assignmentId}</h3>

      <p><strong>Customer:</strong> ${job.customerName}</p>
      <p><strong>Phone:</strong> ${job.customerPhone}</p>
      <p><strong>Address:</strong> ${job.address}</p>
      <p><strong>Assignment Status:</strong> ${job.assignmentStatus}</p>
      <p><strong>Request Status:</strong> ${job.requestStatus}</p>
      <p><strong>Assigned On:</strong> ${new Date(job.assignedDate).toLocaleString()}</p>

      <h4>Services</h4>
      <table>
        <thead>
          <tr>
            <th>Service</th>
           
          </tr>
        </thead>
        <tbody>
          ${job.services
            .map(
              (s) => `
            <tr>
              <td>${s.serviceName}</td>
            
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `,
      )
      .join('');

    const html = `
    <html>
      <head>
        <title>Active Assignments Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }

          .receipt-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
          }

          .receipt-card {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 20px;
          }

          h2, h3, h4 {
            margin: 0 0 10px;
          }

          p {
            margin: 5px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .total {
            margin-top: 25px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="receipt-header">
          <h2>Active Assignments Receipt</h2>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        ${rows}

      

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to download the receipt.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
  getMyJobs() {
    this.loading = true;
    this.errorMessage = '';

    this._assignmentsService.getMyJobs().subscribe({
      next: (res: GetTechnicianAssignmentsApiResponse) => {
        this.loading = false;

        if (res.success) {
          this.assignments = res.data;
        } else {
          this.errorMessage = 'Unable to load your jobs.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      },
    });
  }
}
