package com.kq.fleet_and_cargo.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kq.fleet_and_cargo.configurations.SecurityConfiguration;
import com.kq.fleet_and_cargo.controllers.ExpenseController;
import com.kq.fleet_and_cargo.controllers.ReportController;
import com.kq.fleet_and_cargo.models.Expense;
import com.kq.fleet_and_cargo.models.Money;
import com.kq.fleet_and_cargo.payload.request.ExpenseRequest;
import com.kq.fleet_and_cargo.services.ExpenseService;
import com.kq.fleet_and_cargo.services.ReportService;
import com.kq.fleet_and_cargo.filters.JwtAuthFilter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = {ExpenseController.class, ReportController.class})
@Import(ExpenseAccessSecurityTest.TestSecurityConfig.class)
class ExpenseAccessSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private ReportService reportService;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        SecurityConfiguration securityConfiguration(JwtAuthFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
            return new SecurityConfiguration(jwtAuthFilter, authenticationProvider);
        }

        @Bean
        JwtAuthFilter jwtAuthFilter() {
            JwtAuthFilter filter = mock(JwtAuthFilter.class);
            try {
                Mockito.doAnswer(invocation -> {
                    Object request = invocation.getArgument(0);
                    Object response = invocation.getArgument(1);
                    jakarta.servlet.FilterChain chain = invocation.getArgument(2);
                    chain.doFilter((jakarta.servlet.ServletRequest) request, (jakarta.servlet.ServletResponse) response);
                    return null;
                }).when(filter).doFilter(any(), any(), any());
            } catch (Exception e) {
                throw new IllegalStateException("Failed to configure JwtAuthFilter mock", e);
            }
            return filter;
        }

        @Bean
        AuthenticationProvider authenticationProvider() {
            return mock(AuthenticationProvider.class);
        }
    }

    private MockMultipartFile expensePart() {
        String payload = "{" +
                "\"description\":\"Taxi\"," +
                "\"amount\":10," +
                "\"currencyCode\":\"USD\"," +
                "\"incurredAt\":\"2024-01-01T00:00:00Z\"" +
                "}";
        return new MockMultipartFile("expense", "expense.json", MediaType.APPLICATION_JSON_VALUE,
                payload.getBytes(StandardCharsets.UTF_8));
    }

    private Expense sampleExpense() {
        return Expense.builder()
                .id("expense-1")
                .description("Taxi")
                .amount(new Money(BigDecimal.TEN, "USD"))
                .incurredAt(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
                .build();
    }

    @Test
    @WithMockUser(authorities = "USER")
    void userCanCreateExpense() throws Exception {
        given(expenseService.create(any(ExpenseRequest.class), any())).willReturn(sampleExpense());

        mockMvc.perform(multipart("/api/expenses")
                        .file(expensePart())
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "USER")
    void userCanDownloadExpenseReport() throws Exception {
        given(reportService.generateExpenseDetailedReport(any(), any(), any())).willReturn("report".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(get("/api/reports/expenses"))
                .andExpect(status().isOk());
    }

    @Test
    void unauthenticatedUserCannotCreateExpense() throws Exception {
        mockMvc.perform(multipart("/api/expenses")
                        .file(expensePart())
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "VIEWER")
    void userWithoutRequiredAuthorityCannotCreateExpense() throws Exception {
        mockMvc.perform(multipart("/api/expenses")
                        .file(expensePart())
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "VIEWER")
    void userWithoutRequiredAuthorityCannotAccessExpenseReports() throws Exception {
        mockMvc.perform(get("/api/reports/expenses"))
                .andExpect(status().isForbidden());
    }
}
