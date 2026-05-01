import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StaticsService } from './../../Services/statics.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface StatCard {
  title: string;
  value: number;
  icon: string;
  className: string;
}

@Component({
  selector: 'app-statics',
  templateUrl: './statics.component.html',
  styleUrls: ['./statics.component.scss'],
})
export class StaticsComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = false;

  pendingCount = 0;
  inProgressCount = 0;
  canceledCount = 0;
  approvedCount = 0;

  underReviewCount = 0;
  completedCount = 0;
  rejectedCount = 0;
  onHoldCount = 0;
  awaitingPaymentCount = 0;
  assignedCount = 0;

  statCards: StatCard[] = [];
  private pieChart: Chart | null = null;
  private viewInitialized = false;

  constructor(private _statService: StaticsService) {}

  ngOnInit(): void {
    this.loadStatics();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
  }

  loadStatics(): void {
    this.loading = true;

    forkJoin({
      pending: this._statService.getPendingStatics(),
      inProgress: this._statService.getInprogressStatics(),
      canceled: this._statService.getcanceledStatics(),
      approved: this._statService.getapprovedStatics(),
      underReview: this._statService.getUnderReviewStatics(),
      completed: this._statService.getCompletedStatics(),
      rejected: this._statService.getRejectedStatics(),
      onHold: this._statService.getOnHoldStatics(),
      awaitingPayment: this._statService.getAwaitingPaymentStatics(),
      assigned: this._statService.getAssignedStatics(),
    }).subscribe({
      next: (res) => {
        this.pendingCount = res.pending?.data?.response ?? 0;
        this.inProgressCount = res.inProgress?.data?.response ?? 0;
        this.canceledCount = res.canceled?.data?.response ?? 0;
        this.approvedCount = res.approved?.data?.response ?? 0;

        this.underReviewCount = res.underReview?.data?.response ?? 0;
        this.completedCount = res.completed?.data?.response ?? 0;
        this.rejectedCount = res.rejected?.data?.response ?? 0;
        this.onHoldCount = res.onHold?.data?.response ?? 0;
        this.awaitingPaymentCount = res.awaitingPayment?.data?.response ?? 0;
        this.assignedCount = res.assigned?.data?.response ?? 0;

        this.buildCards();
        this.loading = false;

        setTimeout(() => this.renderChart());
      },
      error: (err) => {
        console.error('Failed to load statics', err);
        this.buildCards();
        this.loading = false;

        setTimeout(() => this.renderChart());
      },
    });
  }

  buildCards(): void {
    this.statCards = [
      {
        title: 'Pending Requests',
        value: this.pendingCount,
        icon: '⌛',
        className: 'pending',
      },
      {
        title: 'In Progress Requests',
        value: this.inProgressCount,
        icon: '⚙',
        className: 'progress',
      },
      {
        title: 'Canceled Requests',
        value: this.canceledCount,
        icon: '✕',
        className: 'canceled',
      },
      {
        title: 'Approved Requests',
        value: this.approvedCount,
        icon: '✓',
        className: 'approved',
      },
      {
        title: 'Under Review Requests',
        value: this.underReviewCount,
        icon: '🔍',
        className: 'under-review',
      },
      {
        title: 'Completed Requests',
        value: this.completedCount,
        icon: '🏁',
        className: 'completed',
      },
      {
        title: 'Rejected Requests',
        value: this.rejectedCount,
        icon: '−',
        className: 'rejected',
      },
      {
        title: 'On Hold Requests',
        value: this.onHoldCount,
        icon: '⏸',
        className: 'on-hold',
      },
      {
        title: 'Awaiting Payment',
        value: this.awaitingPaymentCount,
        icon: '$',
        className: 'awaiting-payment',
      },
      {
        title: 'Assigned Requests',
        value: this.assignedCount,
        icon: '👷',
        className: 'assigned',
      },
    ];
  }

  renderChart(): void {
    if (!this.viewInitialized) return;

    const canvas = document.getElementById(
      'requestsPieChart',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      console.warn('Canvas #requestsPieChart not found');
      return;
    }

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: [
          'Pending',
          'In Progress',
          'Canceled',
          'Approved',
          'Under Review',
          'Completed',
          'Rejected',
          'On Hold',
          'Awaiting Payment',
          'Assigned',
        ],
        datasets: [
          {
            data: [
              this.pendingCount,
              this.inProgressCount,
              this.canceledCount,
              this.approvedCount,
              this.underReviewCount,
              this.completedCount,
              this.rejectedCount,
              this.onHoldCount,
              this.awaitingPaymentCount,
              this.assignedCount,
            ],
            backgroundColor: [
              '#f59e0b',
              '#3b82f6',
              '#ef4444',
              '#10b981',
              '#8b5cf6',
              '#14b8a6',
              '#991b1b',
              '#64748b',
              '#f97316',
              '#0ea5e9',
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Requests Overview',
          },
        },
      },
    };

    this.pieChart = new Chart(canvas, config);
  }

  get totalRequests(): number {
    return (
      this.pendingCount +
      this.inProgressCount +
      this.canceledCount +
      this.approvedCount +
      this.underReviewCount +
      this.completedCount +
      this.rejectedCount +
      this.onHoldCount +
      this.awaitingPaymentCount +
      this.assignedCount
    );
  }

  ngOnDestroy(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }
}
