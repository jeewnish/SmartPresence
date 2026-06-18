package com.smartpresence.backend.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OfflineSyncRequest(
    @NotNull @Valid List<CheckInRequest> records
) {}
