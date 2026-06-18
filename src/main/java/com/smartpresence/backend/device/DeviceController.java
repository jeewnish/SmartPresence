package com.smartpresence.backend.device;

import com.smartpresence.backend.device.dto.DeviceRegisterRequest;
import com.smartpresence.backend.device.dto.DeviceResponse;
import com.smartpresence.backend.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
@Tag(name = "Device", description = "Trusted device registration")
public class DeviceController {

    private final DeviceService deviceService;
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register or re-activate a trusted device")
    public ResponseEntity<DeviceResponse> register(
            @RequestBody @Valid DeviceRegisterRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var user = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(deviceService.register(request, user));
    }

    @GetMapping("/me")
    @Operation(summary = "List my active registered devices")
    public ResponseEntity<List<DeviceResponse>> myDevices(@AuthenticationPrincipal Jwt jwt) {
        var user = userService.requireByClerkUserId(jwt.getSubject());
        return ResponseEntity.ok(deviceService.getMyDevices(user));
    }
}
