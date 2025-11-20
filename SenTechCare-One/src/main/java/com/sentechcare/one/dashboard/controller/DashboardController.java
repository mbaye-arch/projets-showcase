package com.sentechcare.one.dashboard.controller;

import com.sentechcare.one.dashboard.dto.DashboardResponseDto;
import com.sentechcare.one.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponseDto getDashboard() {
        return dashboardService.getDashboard();
    }
}
