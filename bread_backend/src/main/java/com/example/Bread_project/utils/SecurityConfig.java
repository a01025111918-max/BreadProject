package com.example.Bread_project.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
//CORS를 쓰겠다고 연결하는 곳
//보안 정책 담당
//
//인증 / 인가
//필터
//접근 권한
public class SecurityConfig {

    @Bean
    //비밀번호 암호화 작용
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());
        return http.build();

    }
    @Bean
    public BCryptPasswordEncoder bcrypt(){
        return new BCryptPasswordEncoder();
    }


}
