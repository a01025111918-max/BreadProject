package com.example.Bread_project.member.model.service;

import com.example.Bread_project.member.model.dao.MemberDao;
import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.member.model.vo.Member;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService {
    @Autowired
    private MemberDao memberDao;

    @Autowired
    private BCryptPasswordEncoder bcrypt;

    @Autowired
    private JwtUtils jwtUtils;


    //회원 등록
    public int insertJoin(Member member) {
        //회원가입할 때 비밀번호 암호화 등록
        String memberPw = member.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
        System.out.println("memberPw:" + encPw);
        member.setMemberPw(encPw);
        int result = memberDao.insertJoin(member);
        return result;
    }

    //로그인 로직 
    public LoginMember selectOneMember(Member member) {
        Member loginMember = memberDao.selectOneMember(member.getMemberId());

        if (loginMember != null) {
            if (bcrypt.matches(member.getMemberPw(), loginMember.getMemberPw())) {
                LoginMember login = jwtUtils.createToken(loginMember.getMemberNo(), loginMember.getMemberId(), loginMember.getMemberNickname(), loginMember.getMemberRole());

                return login;
            }
            loginMember.setMemberStatus(loginMember.getMemberStatus());
            loginMember.setMemberEmail(loginMember.getMemberEmail());

        }


        return null;
    }

    // 재토큰을 받아 로그인 연장 구현 로직
    public LoginMember refreshToken(String token) {
        LoginMember loginMember = jwtUtils.cheakToken(token);

        if (loginMember == null) {
            return null;
        }

        Member member = memberDao.selectOneMemberByNo(loginMember.getMemberNo());

        if (member == null || !"Y".equals(member.getMemberStatus())) {
            return null;
        }

        return jwtUtils.createToken(
                member.getMemberNo(),
                member.getMemberId(),
                member.getMemberNickname(),
                member.getMemberRole()
        );
    }

    public Member selectOneMemberByNo(Integer memberNo) {
        Member member = memberDao.selectOneMemberByNo(memberNo);
        return member;
    }

    public Member selectOneMemberId(String memberId) {
        Member m = memberDao.selectOneMemberId(memberId);
        return m;
    }

    public String findIdByEmail(String memberEmail) {
        String memberId = memberDao.findIdByEmail(memberEmail);
        return memberId;
    }

    public boolean existByIdAndEmail(String memberId, String memberEmail) {
        Integer result = memberDao.existByIdAndEmail(memberId, memberEmail);
        if (result != null && result > 0) {
            return true;
        }
        return false;
    }
}
