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
    }).subscribe({
      next: (res) => {
        this.pendingCount = res.pending?.data?.response ?? 0;
        this.inProgressCount = res.inProgress?.data?.response ?? 0;
        this.canceledCount = res.canceled?.data?.response ?? 0;
        this.approvedCount = res.approved?.data?.response ?? 0;

        this.buildCards();
        this.loading = false;

        setTimeout(() => {
          this.renderChart();
        });
      },
      error: (err) => {
        console.error('Failed to load statics', err);
        this.buildCards();
        this.loading = false;

        setTimeout(() => {
          this.renderChart();
        });
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
        labels: ['Pending', 'In Progress', 'Canceled', 'Approved'],
        datasets: [
          {
            data: [
              this.pendingCount,
              this.inProgressCount,
              this.canceledCount,
              this.approvedCount,
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'],
            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
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
      this.approvedCount
    );
  }

  ngOnDestroy(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }
}
