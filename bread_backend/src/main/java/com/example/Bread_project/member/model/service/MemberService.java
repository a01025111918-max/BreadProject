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


    // 회원 등록
    // 단순 insert 1번만 수행하므로 트랜잭션을 따로 걸지 않는다.
    // 이렇게 해야 비밀번호 암호화 중 DB 커넥션을 오래 잡지 않는다.
    //-> 이게 뭔 말인가 하면 프론트 엔드와 백엔드 사이에는 10개의 다리 즉 서로 데이터를 주고 받게 하는 열개의 커넥션이 있다.
    //-> 이걸 히카리 라고도 하는데, 문제는 이게 api가 몇개 일때는 문제가 되지 않는데, 점점 많아지면 병목현상이 심화된다.
    //-> 비밀번호 암호화 작업은 매우 무거운 작업 중 하나이다. 즉, 수천번의 연산을 통해 수행되는 작업이다.
    //-> 트랜잭션을 걸게 되면 비밀번호 암호화 작업이 끝날 떄까지, 커넥션이 묶여있게 되는데, 그동안 다른 작업들이 연달아 수행할 때 해결되지 못하고
    //-> 대기를 타다가 30초정도를 넘기게 되면 서버가 터지게 된다.
    public int insertJoin(Member member) {
        //회원가입할 때 비밀번호 암호화 등록
        String memberPw = member.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
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

    // 아이디 중복 체크 로직
    public boolean selectOneMemberId(String memberId) {
        int count = memberDao.selectOneMemberId(memberId);
        return count > 0;
    }

    public String findIdByEmail(String memberEmail) {
        String memberId = memberDao.findIdByEmail(memberEmail);
        return memberId;
    }

    // 비밀번호 재설정 로직
    // 단일 update만 수행하므로 별도 트랜잭션을 걸지 않는다.
    public int resetPw(Member member) {
        String encPw = bcrypt.encode(member.getMemberPw());
        member.setMemberPw(encPw);
        int result = memberDao.updateMemberPw(member);
        return result;
    }

    public boolean existByIdAndEmail(String memberId, String memberEmail) {
        Integer result = memberDao.existByIdAndEmail(memberId, memberEmail);
        if (result != null && result > 0) {
            return true;
        }
        return false;
    }
}
