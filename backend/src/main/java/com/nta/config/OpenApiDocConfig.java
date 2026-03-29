package com.nta.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiDocConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes(
                                "bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addServersItem(new Server().url("http://localhost:8080/api").description("Local"))
                .addServersItem(new Server().url("https://api.luyenviet.com").description("Production"))
                .info(new Info()
                        .title("Luyenviet API")
                        .version("v1.0")
                        .description("Luyenviet Application APIs")
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")));
    }

    @Bean
    public GroupedOpenApi adminOpenApiGroup() {
        return GroupedOpenApi.builder().group("admin").pathsToMatch("/admin/**").build();
    }

    @Bean
    public GroupedOpenApi publicOpenApiGroup() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToExclude("/admin/**")
                .build();
    }
}
