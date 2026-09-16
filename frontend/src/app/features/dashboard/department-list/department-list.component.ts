import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DepartmentSummaryDTO } from '../../../core/models/analytics.model';

interface DepartmentTypeRow {
  departmentType: string;
  unitCount: number;
  totalHeadcount: number;
  avgSalary: number | null;
  avgTurnoverRatePct: number;
}

type SortColumn = 'departmentType' | 'unitCount' | 'totalHeadcount' | 'avgSalary' | 'avgTurnoverRatePct';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  private rawSummary: DepartmentSummaryDTO[] = [];
  typeRows: DepartmentTypeRow[] = [];

  loading = true;
  error = false;

  searchTerm = '';
  sortColumn: SortColumn = 'departmentType';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 25;
  currentPage = 1;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;

    this.analyticsService.getDepartmentSummary().subscribe({
      next: (data) => {
        this.rawSummary = data;
        this.typeRows = this.groupByType(data);
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  /** Groups the per-department rows into one row per department_type,
   * weighting the averaged salary and turnover by each department's
   * headcount so a small unit doesn't skew the type-level average as
   * much as a large one. */
  private groupByType(rows: DepartmentSummaryDTO[]): DepartmentTypeRow[] {
    const byType = new Map<string, DepartmentSummaryDTO[]>();
    rows.forEach(r => {
      const key = r.departmentType || 'Non classé';
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key)!.push(r);
    });

    return Array.from(byType.entries()).map(([departmentType, units]) => {
      const totalHeadcount = units.reduce((sum, u) => sum + (u.headcount || 0), 0);

      const salaryWeightedSum = units.reduce(
        (sum, u) => sum + (u.avgSalary || 0) * (u.headcount || 0), 0
      );
      const avgSalary = totalHeadcount > 0 ? salaryWeightedSum / totalHeadcount : null;

      const turnoverWeightedSum = units.reduce(
        (sum, u) => sum + (u.turnoverRatePct || 0) * (u.headcount || 0), 0
      );
      const avgTurnoverRatePct = totalHeadcount > 0 ? turnoverWeightedSum / totalHeadcount : 0;

      return {
        departmentType,
        unitCount: units.length,
        totalHeadcount,
        avgSalary,
        avgTurnoverRatePct
      };
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

  private sortValue(d: DepartmentTypeRow, column: SortColumn): string | number {
    switch (column) {
      case 'departmentType': return d.departmentType.toLowerCase();
      case 'unitCount': return d.unitCount;
      case 'totalHeadcount': return d.totalHeadcount;
      case 'avgSalary': return d.avgSalary ?? -1;
      case 'avgTurnoverRatePct': return d.avgTurnoverRatePct;
    }
  }

  get filteredTypes(): DepartmentTypeRow[] {
    let result = [...this.typeRows];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(d => d.departmentType.toLowerCase().includes(term));
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
    return Math.max(1, Math.ceil(this.filteredTypes.length / this.pageSize));
  }

  get paginatedTypes(): DepartmentTypeRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTypes.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToType(departmentType: string): void {
    this.router.navigate(['/dashboard/department-type', encodeURIComponent(departmentType)]);
  }

  turnoverClass(pct: number): string {
    if (pct >= 20) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (pct >= 10) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  }
}