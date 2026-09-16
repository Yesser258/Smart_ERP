package com.smarterp.hr.repository;

import com.smarterp.hr.domain.Employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @EntityGraph(attributePaths = {"department", "manager"})
    @Query("SELECT e FROM Employee e")
    List<Employee> findAllWithRelations();
    long countByIsDeletedFalse();
    
    long countByIsDeletedFalseAndEmployeeStatusIn(Collection<String> statuses);
    @Query("""
        SELECT e FROM Employee e
        JOIN FETCH e.department
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Employee> findPageWithSearch(@Param("search") String search, Pageable pageable);

    
}