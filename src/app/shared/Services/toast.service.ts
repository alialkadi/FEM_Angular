import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 30000
  ) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [`toast-${type}`]
    });
  }
}
