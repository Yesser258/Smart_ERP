import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
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
  searching = false;

  searchTerm = '';
  sortColumn: SortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 25;
  currentPage = 0; // 0-based, matches Spring's Pageable
  totalElements = 0;
  totalPages = 1;

  // Debounces search input so typing doesn't fire a request per keystroke
  private searchTrigger$ = new Subject<void>();

ngOnInit(): void {
  this.searchTrigger$.pipe(
    debounceTime(300),
    switchMap(() => {
      this.currentPage = 0;
      this.searching = true;
      return this.fetchPage$();
    })
  ).subscribe(this.handleResult.bind(this));

  this.load();
}

  private fetchPage$() {
    return this.hrService.getEmployeesPaged(
      this.currentPage, this.pageSize, this.searchTerm, this.sortColumn, this.sortDirection
    );
  }

   // only for the very first load (shows the big spinner, hides table)
   // for subsequent loads (search/sort/pagination) — table area only

private handleResult(page: any): void {
  this.employees = page.content;
  this.totalElements = page.totalElements;
  this.totalPages = page.totalPages;
  this.loading = false;
  this.searching = false;
  this.error = false;
}

load(): void {
  if (this.employees.length === 0) {
    this.loading = true;
  } else {
    this.searching = true;
  }
  this.error = false;
  this.fetchPage$().subscribe({
    next: (page) => this.handleResult(page),
    error: () => { this.error = true; this.loading = false; this.searching = false; }
  });
}

  onSearchChange(): void {
    this.searchTrigger$.next();
  }

  toggleSort(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.load();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.load();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.load();
    }
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