package com.smartprecence.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartprecence.demo.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // You can later add custom queries here, like finding a student by email
}