package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.Department;
import com.smartpresence.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department lookup data")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @Operation(summary = "List departments for course forms", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments(
            @RequestParam(required = false) Boolean isActive) {
        List<Department> departments = (isActive != null)
                ? departmentRepository.findByIsActive(isActive)
                : departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(departments));
    }
}
