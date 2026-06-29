package com.example.Bread_project.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

//5173을 허용한다고 실제 규칙을 적는 곳
//브라우저 통신 규칙 담당
//
//어떤 origin 허용?
//어떤 header 허용?
//OPTIONS 처리
// React에서 Authorization 헤더에 토큰을 담아 요청하면
// 브라우저가 사전 요청(OPTIONS, preflight)을 먼저 보내므로
// CORS 설정에서 Origin, Header, Method를 허용해야 한다.
@Configuration
public class CorsConfig {
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

        // 허용할 프론트 주소들
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://192.168.0.101:5173",
                "http://172.30.1.54:5173/",
                "http://192.168.31.37:5173/",
                "https://wriggly-arise-plating.ngrok-free.dev"
        ));


        // 허용할 요청 헤더
        config.setAllowedHeaders(List.of("*"));

        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", config);
    return source;
    }


}
