import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-content">
        <mat-spinner diameter="50"></mat-spinner>
        <p>處理中，請稍候...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .loading-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .loading-content p {
      margin-top: 10px;
      color: #333;
    }
  `]
})
export class LoadingComponent {
  @Input() isLoading: boolean = false;
}