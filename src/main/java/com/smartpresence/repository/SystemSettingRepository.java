package com.smartpresence.repository;

import com.smartpresence.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Integer> {

    Optional<SystemSetting> findBySettingKey(String key);

    List<SystemSetting> findBySettingGroup(SystemSetting.SettingGroup group);
}
