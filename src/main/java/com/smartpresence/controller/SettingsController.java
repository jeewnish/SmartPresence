package com.smartpresence.controller;

import com.smartpresence.dto.response.ApiResponse;
import com.smartpresence.entity.SystemSetting;
import com.smartpresence.entity.User;
import com.smartpresence.security.JwtHelper;
import com.smartpresence.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Settings", description = "System configuration — BLE thresholds, security policies")
public class SettingsController {

    private final SystemSettingService settingService;
    private final JwtHelper            jwtHelper;

    @GetMapping("/group/{group}")
    @Operation(summary = "Get all settings for a tab group", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getByGroup(
            @PathVariable SystemSetting.SettingGroup group) {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getByGroup(group)));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get a single setting value by key", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<String>> get(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getValue(key)));
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update a setting value (BLE RSSI threshold slider etc.)", security = @SecurityRequirement(name = "oauth2"))
    public ResponseEntity<ApiResponse<SystemSetting>> update(
            @PathVariable String key,
            @RequestParam String value,
            @AuthenticationPrincipal Jwt jwt) {

        User admin = jwtHelper.resolveUser(jwt);
        SystemSetting updated = settingService.updateSetting(key, value, admin.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Setting updated", updated));
    }
}
