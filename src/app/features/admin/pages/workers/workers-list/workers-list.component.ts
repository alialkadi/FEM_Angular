import { Component, OnInit } from "@angular/core";
import { ApiResponse } from "../../../../Models/ApiResponse";
import { GeneralResponse } from "../../../../Models/general-response.model";
import { CreateWorkerService } from "../../../Services/create-worker.service";
import { WorkersResponseModel } from "../../../Services/workers.model";


@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.scss']
})
export class WorkersListComponent implements OnInit {

  workers: WorkersResponseModel[] = [];
  loading = true;
  errorMessage = '';

  constructor(private workerService: CreateWorkerService) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers() {
    this.loading = true;
    this.errorMessage = '';

    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success && res.data) {
          // If backend returns a LIST, ensure correct shape
          const response = res.data as any;

          this.workers = Array.isArray(response)
            ? response
            : [response];

        } else {
          this.errorMessage = 'Failed to load workers.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'An error occurred while fetching workers.';
      }
    });
  }
}
