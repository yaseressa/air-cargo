package com.kq.fleet_and_cargo.configurations;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.kq.fleet_and_cargo.filters.JwtAuthFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfiguration {

        private final JwtAuthFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        private static final String[] WHITE_LIST_URL = {
                        "/auth/**",
                        "/api-docs",
                        "/api-docs/**",
                        "/configuration/ui",
                        "/swagger-resources/**",
                        "/configuration/security",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/webjars/**",
                        "/api/cargos/tracking/public/**",
                        "/api/cargos/file/**",
                        "/api/cargos/*/files",
                        "/api/cargos/file/*/preview"
        };

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http.cors(Customizer.withDefaults());
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(req -> req
                                                .requestMatchers(WHITE_LIST_URL).permitAll()
                                                .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                                                .requestMatchers("/api/files/**").permitAll()
                                                .requestMatchers("/auth/toggle/**").hasAuthority("ADMIN")
                                                .requestMatchers(HttpMethod.GET, "/api/locations/**")
                                                .hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/locations/**").hasAuthority("ADMIN")
                                                .requestMatchers("/api/fx-rates/supported-currencies")
                                                .hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/fx-rates/**").hasAuthority("ADMIN")
                                                .requestMatchers("/api/cargos/**").hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/expenses/**").hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/customers/**").hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/notifications/**")
                                                .hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/analytics/**").hasAnyAuthority("ADMIN", "USER")
                                                .requestMatchers("/api/reports/**").hasAnyAuthority("ADMIN", "USER")
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .logout(logout -> logout.logoutUrl("/auth/logout"));

                return http.build();
        }

}
