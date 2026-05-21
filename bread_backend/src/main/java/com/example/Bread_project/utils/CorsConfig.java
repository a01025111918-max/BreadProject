package com.example.Bread_project.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    config.addAllowedOrigin("http://localhost:5173, http://localhost:5174");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", config);
    return source;
    }


}
