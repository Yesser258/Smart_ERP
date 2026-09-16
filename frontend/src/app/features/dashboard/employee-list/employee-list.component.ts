import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HrService } from '../../../core/services/hr.service';
import { EmployeeDTO } from '../../../core/models/hr.model';

type SortColumn = 'name' | 'title' | 'department' | 'employeeStatus' | 'salary' | 'startDate';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  private hrService = inject(HrService);
  private router = inject(Router);

  employees: EmployeeDTO[] = [];
  loading = true;
  error = false;

  searchTerm = '';
  sortColumn: SortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 25;
  currentPage = 1;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.hrService.getAllEmployees().subscribe({
      next: (data) => { this.employees = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  toggleSort(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  private sortValue(e: EmployeeDTO, column: SortColumn): string | number {
    switch (column) {
      case 'name': return `${e.firstName} ${e.lastName}`.toLowerCase();
      case 'title': return (e.title || '').toLowerCase();
      case 'department': return (e.departmentName || '').toLowerCase();
      case 'employeeStatus': return (e.employeeStatus || '').toLowerCase();
      case 'salary': return e.salary ?? 0;
      case 'startDate': return e.startDate ? new Date(e.startDate).getTime() : 0;
    }
  }

  get filteredEmployees(): EmployeeDTO[] {
    let result = [...this.employees];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const av = this.sortValue(a, this.sortColumn);
      const bv = this.sortValue(b, this.sortColumn);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
  }

  get paginatedEmployees(): EmployeeDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToDetail(employeeId: number): void {
    this.router.navigate(['/dashboard/employee', employeeId]);
  }

  statusClass(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'ON LEAVE':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'TERMINATED':
      case 'TERMINATED FOR CAUSE':
      case 'VOLUNTARILY TERMINATED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'FUTURE START':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }
}
