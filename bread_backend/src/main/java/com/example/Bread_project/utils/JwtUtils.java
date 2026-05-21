package com.example.Bread_project.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.example.Bread_project.member.model.vo.LoginMember;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret-key}")
    private String secretKey;
    @Value("${jwt.expire-hour}")
    private Integer expireHour;

    public LoginMember createToken(Integer memberNo, String memberId, String memberNickname, String memberRole ){
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        Calendar calendar = Calendar.getInstance();
        Date startTime = calendar.getTime();
        calendar.add(Calendar.HOUR, expireHour);
        Date endTime = calendar.getTime();

        String token = Jwts.builder().issuedAt(startTime)
                .expiration(endTime)
                .signWith(key)
                .claim("memberId",memberId)
                .claim("memberNo",memberNo)
                .claim("memberNickname",memberNickname)
                .claim("memberRoll",memberRole)
                .compact();

        LoginMember login = new LoginMember();
        login.setMemberId(memberId);
        login.setMemberNo(memberNo);
        login.setMemberNickname(memberNickname);
        login.setMemberRole(memberRole);
        login.setToken(token);
        login.setEndTime(endTime.getTime());

        return login;




    }

    public LoginMember cheakToken(String token){

        try {
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
            Claims clims = (Claims) Jwts.parser().verifyWith(key).build().parse(token).getPayload();
            String memberId = (String) clims.get("memberId");
            Integer memberNo = (Integer) clims.get("memberNo");
            String memberNickname = (String) clims.get("memberNickname");
            String memberRole = (String) clims.get("memberRole");
            LoginMember login = new LoginMember();
            login.setMemberId(memberId);
            login.setMemberNo(memberNo);
            login.setMemberNickname(memberNickname);
            login.setMemberRole(memberRole);
            return login;
        } catch (io.jsonwebtoken.ExpiredJwtException e){
            System.out.println("토큰 만료됨");
            return null;
        } catch (io.jsonwebtoken.SignatureException e) {
            System.out.println("유효하지 않은 토큰");
            return null;

        }
    }
}
