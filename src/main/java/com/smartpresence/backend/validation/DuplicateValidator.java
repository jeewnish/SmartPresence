package com.smartpresence.backend.validation;

import com.smartpresence.backend.attendance.AttendanceRepository;
import com.smartpresence.backend.ble.CheckinResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 8: Duplicate attendance check.
 *
 * Ensures the student has not already been marked PRESENT for this session.
 * The DB has a UNIQUE constraint on (student_id, session_id) as a final safeguard.
 */
@Component
@RequiredArgsConstructor
public class DuplicateValidator {

    private final AttendanceRepository attendanceRepository;

    public void validate(ValidationContext ctx) {
        if (attendanceRepository.existsByStudentIdAndSessionId(
                ctx.getStudent().getId(), ctx.getSessionId())) {
            throw new ValidationException(CheckinResult.ALREADY_PRESENT,
                "Student is already marked as present for this session");
        }
    }
}
