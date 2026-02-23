package com.smartprecence.demo.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "device")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId; // 

    private String deviceModel; // 
    private String osType; // e.g., Android, iOS 
    private String osVersion; // 
    
    @Column(unique = true, nullable = false)
    private String deviceFingerprint; // Crucial for your Device Binding methodology [cite: 88, 165]

    private boolean isActive; // 

    @Temporal(TemporalType.TIMESTAMP)
    private Date registeredDate; // 

    // The foreign key linking back to the Student table 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // TODO: Generate Getters and Setters
}