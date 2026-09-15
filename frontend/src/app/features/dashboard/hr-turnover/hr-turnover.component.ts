import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DepartmentTurnoverDTO } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-hr-turnover',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './hr-turnover.component.html'
})
export class HrTurnoverComponent {
  @Input() turnoverChart: any;
  @Input() turnoverTypeChart: any;
  @Input() rawTurnoverData: DepartmentTurnoverDTO[] = [];

  pageSize = 25;
  currentPage = 1;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rawTurnoverData.length / this.pageSize));
  }

  get paginatedData(): DepartmentTurnoverDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rawTurnoverData.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }
}
