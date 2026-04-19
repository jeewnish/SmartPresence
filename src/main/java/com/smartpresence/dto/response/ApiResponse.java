package com.smartpresence.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Generic API response wrapper.
 *
 * NOTE: @Builder cannot be used on a generic class with static factory
 * methods that return ApiResponse<T> — Lombok generates a raw-type builder
 * which Java 21 rejects. The three static factories below replace @Builder.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private T       data;

    // ── Static factory methods (replace @Builder for generic types) ───────────

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
