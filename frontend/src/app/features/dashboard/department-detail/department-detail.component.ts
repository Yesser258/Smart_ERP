import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DepartmentSummaryDTO, RecruitmentFunnelAtsDTO, TrainingAnalyticsDTO } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-detail.component.html'
})
export class DepartmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);

  department: DepartmentSummaryDTO | null = null;
  openJobPostings = 0;
  totalApplications = 0;
  trainingInvestment = 0;
  trainedEmployeesCount = 0;

  loading = true;
  error = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loading = true;
    this.error = false;

    forkJoin({
      summary: this.analyticsService.getDepartmentSummary(),
      funnel: this.analyticsService.getRecruitmentFunnelStats(),
      training: this.analyticsService.getTrainingAnalyticsStats()
    }).subscribe({
      next: ({ summary, funnel, training }) => {
        this.department = summary.find(d => d.departmentId === id) || null;
        if (!this.department) {
          this.error = true;
          this.loading = false;
          return;
        }

        const deptJobs = funnel.filter((f: RecruitmentFunnelAtsDTO) => f.departmentId === id);
        this.openJobPostings = deptJobs.filter(f => (f.postingStatus || '').toUpperCase() === 'OPEN').length;
        this.totalApplications = deptJobs.reduce((sum, f) => sum + (f.totalApplications || 0), 0);

        const deptTraining = training.filter((t: TrainingAnalyticsDTO) => t.departmentId === id);
        this.trainingInvestment = deptTraining.reduce((sum, t) => sum + (t.totalTrainingInvestment || 0), 0);
        this.trainedEmployeesCount = deptTraining.reduce((sum, t) => sum + (t.trainedEmployeesCount || 0), 0);

        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
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