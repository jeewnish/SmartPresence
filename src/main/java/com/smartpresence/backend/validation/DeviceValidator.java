package com.smartpresence.backend.validation;

import com.smartpresence.backend.ble.CheckinResult;
import com.smartpresence.backend.device.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Step 1: Device validation.
 *
 * Checks:
 *   - Device exists and is active.
 *   - Device belongs to the authenticated student.
 */
@Component
@RequiredArgsConstructor
public class DeviceValidator {

    private final DeviceRepository deviceRepository;

    public void validate(ValidationContext ctx) {
        var device = deviceRepository.findByDeviceIdAndActiveTrue(ctx.getDeviceIdString())
            .orElseThrow(() -> new ValidationException(
                CheckinResult.INVALID_DEVICE, "Device not found or inactive: " + ctx.getDeviceIdString()));

        if (!device.getUser().getId().equals(ctx.getStudent().getId())) {
            throw new ValidationException(CheckinResult.INVALID_DEVICE,
                "Device does not belong to the authenticated student");
        }

        ctx.setDevice(device);
    }
}
