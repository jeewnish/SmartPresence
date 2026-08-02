package com.smartpresence.backend;

import com.smartpresence.backend.attendance.AttendanceRecord;
import com.smartpresence.backend.ble.BleCheckinEvent;
import com.smartpresence.backend.device.DeviceRegistration;
import com.smartpresence.backend.session.AttendanceSession;
import com.smartpresence.backend.user.User;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PostgresEnumMappingTest {

    @Test
    void allPostgresEnumFieldsUseNamedEnumJdbcBinding() throws Exception {
        assertNamedEnum(User.class, "role");
        assertNamedEnum(DeviceRegistration.class, "platform");
        assertNamedEnum(AttendanceSession.class, "status");
        assertNamedEnum(AttendanceRecord.class, "status");
        assertNamedEnum(AttendanceRecord.class, "verificationMethod");
        assertNamedEnum(BleCheckinEvent.class, "result");
    }

    @Test
    void varcharDepartmentsDoNotUseNamedEnumJdbcBinding() throws Exception {
        assertThat(User.class.getDeclaredField("department").getAnnotation(JdbcTypeCode.class)).isNull();
        assertThat(com.smartpresence.backend.course.Course.class.getDeclaredField("department")
            .getAnnotation(JdbcTypeCode.class)).isNull();
    }

    private static void assertNamedEnum(Class<?> entity, String fieldName) throws Exception {
        var annotation = entity.getDeclaredField(fieldName).getAnnotation(JdbcTypeCode.class);
        assertThat(annotation).as(entity.getSimpleName() + "." + fieldName).isNotNull();
        assertThat(annotation.value()).isEqualTo(SqlTypes.NAMED_ENUM);
    }
}
