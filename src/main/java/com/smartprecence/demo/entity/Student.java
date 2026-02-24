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
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String status;

    @Temporal(TemporalType.DATE)
    private Date enrollmentDate;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Device> devices;

    // ── Constructors ──────────────────────────────────────────
    public Student() {}

    public Student(String firstName, String lastName, String email,
                   String phoneNumber, String status, Date enrollmentDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.status = status;
        this.enrollmentDate = enrollmentDate;
    }

    // ── Getters ───────────────────────────────────────────────
    public Long getStudentId() { return studentId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getStatus() { return status; }
    public Date getEnrollmentDate() { return enrollmentDate; }
    public List<Device> getDevices() { return devices; }

    // ── Setters ───────────────────────────────────────────────
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setStatus(String status) { this.status = status; }
    public void setEnrollmentDate(Date enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public void setDevices(List<Device> devices) { this.devices = devices; }
}