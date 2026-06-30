import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  warning(arg0: string) {
    throw new Error('Method not implemented.');
  }
  success(arg0: any) {
    throw new Error('Method not implemented.');
  }
  error(arg0: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private snackBar: MatSnackBar) {}

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 3000,
  ) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [`toast-${type}`],
    });
  }
}
