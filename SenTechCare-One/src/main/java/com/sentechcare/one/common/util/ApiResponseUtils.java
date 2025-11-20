package com.sentechcare.one.common.util;

import com.sentechcare.one.common.api.ApiResponse;
import com.sentechcare.one.common.api.PageResponse;
import com.sentechcare.one.common.constants.ApiConstants;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;

public final class ApiResponseUtils {

    private ApiResponseUtils() {
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(ApiConstants.DEFAULT_SUCCESS_MESSAGE, data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .code(200)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .code(201)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static ApiResponse<Void> noContent(String message) {
        return ApiResponse.<Void>builder()
            .success(true)
            .message(message)
            .code(204)
            .data(null)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<PageResponse<T>> paged(Page<T> page) {
        return paged(ApiConstants.DEFAULT_SUCCESS_MESSAGE, page);
    }

    public static <T> ApiResponse<PageResponse<T>> paged(String message, Page<T> page) {
        return ApiResponse.<PageResponse<T>>builder()
            .success(true)
            .message(message)
            .code(200)
            .data(PageUtils.toPageResponse(page))
            .timestamp(LocalDateTime.now())
            .build();
    }
}
