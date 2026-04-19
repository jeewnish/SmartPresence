package com.smartpresence.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    /**
     * Thread pool for @Async methods — used by BleBroadcastService
     * and BeaconMonitorService to avoid blocking the HTTP request thread
     * when pushing WebSocket events.
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(4);
        exec.setMaxPoolSize(10);
        exec.setQueueCapacity(100);
        exec.setThreadNamePrefix("sp-async-");
        exec.initialize();
        return exec;
    }

    /**
     * Dedicated scheduler thread pool — replaces the default single-thread
     * scheduler so that BLE token rotation, beacon health checks, and
     * stale session cleanup do not block each other.
     */
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(3);
        scheduler.setThreadNamePrefix("sp-scheduler-");
        scheduler.setErrorHandler(t ->
                org.slf4j.LoggerFactory.getLogger(AsyncConfig.class)
                        .error("Scheduled task error: {}", t.getMessage(), t));
        return scheduler;
    }
}
