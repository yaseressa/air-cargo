package com.kq.fleet_and_cargo.configurations;


import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.kq.fleet_and_cargo.services.AuthService;
import com.kq.fleet_and_cargo.services.OtpService;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;


@Configuration
@EnableWebMvc
public class WebConfiguration implements WebMvcConfigurer {
    @Value("${spring.application.version}")
    private String version;
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    @Bean
    public OpenAPI openAPI(OtpService otpService, AuthService authService) {

            SecurityScheme jwtScheme = new SecurityScheme().type(SecurityScheme.Type.HTTP)
                            .bearerFormat("JWT")
                            .scheme("bearer");

            return new OpenAPI()
                            .info(new Info()
                                            .title("Fleet and Cargo API")
                                            .version("1.0")
                                            .description("API documentation with API Key and Secret"))
                            .addSecurityItem(new SecurityRequirement()
                                            .addList("Bearer Authentication"))
                            .components(new io.swagger.v3.oas.models.Components()

                                            .addSecuritySchemes("Bearer Authentication", jwtScheme))
                            .info(new Info().title("Hyper FMS API")
                                            .description("Some custom description of Hyper FMS API.<br/>" +
                                                            "</dd><dt>Bearer Token</dt><dd> generate it by calling /auth/login and using the following credentials: "
                                                            +
                                                            "<br/>" +
                                                            "<pre>" +
                                                            "{\n" +
                                                            "  \"email\": \"admin@example.com\",\n" +
                                                            "  \"password\": \"admin\"\n" +
                                                            "}" +
                                                            "</pre>" +
                                                            "<p style=\"color: red;\">then use the auth/otp-valid endpoint and use the userId and the OTP code to generate the token</p>"
                                                            +

                                                            "</dd></dl>")

                                            .version(version).contact(new Contact().name("Yaser Issa")
                                                            .email("yaseressa222@gmail.com").url("Garoon")));

    }
    @Value("${file.storage.local.dir:uploads}")
private String localBaseDir;

@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String loc = Paths.get(localBaseDir, "files")
                      .toAbsolutePath()
                      .normalize()
                      .toUri()
                      .toString(); // e.g. "file:/var/app/uploads/files/"

    registry.addResourceHandler("/files/**")
            .addResourceLocations(loc);
}
}
