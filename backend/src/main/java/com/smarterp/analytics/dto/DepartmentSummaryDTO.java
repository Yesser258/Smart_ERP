package com.smarterp.analytics.dto;

public record DepartmentSummaryDTO(
    Long departmentId,
    String businessUnit,
    String departmentType,
    String divisionDescription,
    Long headcount,
    Double avgSalary,
    Double turnoverRatePct,
    Long activeCount,
    Long terminatedCount
) {}