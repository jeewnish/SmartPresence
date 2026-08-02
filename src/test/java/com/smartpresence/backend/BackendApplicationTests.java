package com.smartpresence.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static org.assertj.core.api.Assertions.assertThat;

class BackendApplicationTests {

	@Test
	void applicationEntryPointIsConfigured() {
		assertThat(BackendApplication.class.isAnnotationPresent(SpringBootApplication.class)).isTrue();
	}

}
