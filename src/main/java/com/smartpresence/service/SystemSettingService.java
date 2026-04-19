package com.smartpresence.service;

import com.smartpresence.entity.AuditLog;
import com.smartpresence.entity.SystemSetting;
import com.smartpresence.entity.User;
import com.smartpresence.repository.AuditLogRepository;
import com.smartpresence.repository.SystemSettingRepository;
import com.smartpresence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final AuditLogRepository      auditLogRepository;
    private final UserRepository          userRepository;

    @Transactional(readOnly = true)
    public List<SystemSetting> getByGroup(SystemSetting.SettingGroup group) {
        return settingRepository.findBySettingGroup(group);
    }

    @Transactional(readOnly = true)
    public String getValue(String key) {
        return settingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElseThrow(() -> new IllegalArgumentException("Unknown setting key: " + key));
    }

    @Transactional(readOnly = true)
    public int getIntValue(String key) {
        return Integer.parseInt(getValue(key));
    }

    @Transactional(readOnly = true)
    public boolean getBoolValue(String key) {
        return Boolean.parseBoolean(getValue(key));
    }

    /**
     * Update a setting value — called by the Admin Settings page (e.g. BLE threshold slider).
     */
    @Transactional
    public SystemSetting updateSetting(String key, String newValue, Integer actorId) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Unknown setting key: " + key));
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalArgumentException("Actor not found"));

        String oldValue = setting.getSettingValue();
        setting.setSettingValue(newValue);
        setting.setLastUpdatedBy(actor);
        setting.setUpdatedAt(OffsetDateTime.now());
        SystemSetting saved = settingRepository.save(setting);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action("CHANGE_SETTING")
                .entityType("system_setting")
                .entityId(setting.getSettingId())
                .oldValue(Map.of("key", key, "value", oldValue))
                .newValue(Map.of("key", key, "value", newValue))
                .build());

        return saved;
    }
}
