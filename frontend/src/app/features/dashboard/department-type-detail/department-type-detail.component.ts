import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DepartmentSummaryDTO } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-department-type-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-type-detail.component.html'
})
export class DepartmentTypeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);

  departmentType = '';
  units: DepartmentSummaryDTO[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.departmentType = decodeURIComponent(this.route.snapshot.paramMap.get('type') || '');
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.analyticsService.getDepartmentSummary().subscribe({
      next: (data) => {
        this.units = data.filter(d => (d.departmentType || 'Non classé') === this.departmentType);
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  goToDetail(departmentId: number): void {
    this.router.navigate(['/dashboard/departments', departmentId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  turnoverClass(pct: number): string {
    if (pct >= 20) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (pct >= 10) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  }
}