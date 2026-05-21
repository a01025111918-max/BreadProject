package com.example.Bread_project.member.controller;

import com.example.Bread_project.member.model.service.MemberService;
import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.member.model.vo.Member;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/auth")
//따로 토큰 인증 로직을 분리
public class AuthController {
    //객체를 자동으로 넣어주는 기능
    @Autowired
    private JwtUtils jwtUtils;
    //MemberService memberService = new MemberServiceImpl();
    //--> 사실 이 구조인데 이걸 spring이 대신 해주고 있음.
    @Autowired
    private MemberService memberService;

    //토큰과는 별도로 헤더에 저장해놓고 서버에 맞춰 계속 업데이트할 변수값 저장 로직 설정

    @GetMapping(value = "/me")
    public ResponseEntity<?> authMe(@RequestHeader("Authorization") String authorization){
        String token = authorization.replace("Bearer ", "");
        LoginMember loginMember = jwtUtils.cheakToken(token);
        Member member = memberService.selectOneMemberByNo(loginMember.getMemberNo());
        return ResponseEntity.ok(member);
    }
}
