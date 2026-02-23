package com.smartprecence.demo.entity;

import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name="student")

public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId; // Matches student_id 

    private String firstName; // 
    private String lastName; // 
    private String email; // 
    private String phoneNumber; // 
    private String status; // Active or Inactive 
    
    @Temporal(TemporalType.DATE)
    private Date enrollmentDate; // 

    // A student can have devices associated with them (1-to-M in ER diagram) 
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Device> devices;
}
