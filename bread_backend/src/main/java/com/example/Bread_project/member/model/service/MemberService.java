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
        System.out.println("memberPw:"+encPw);
        member.setMemberPw(encPw);
        int result = memberDao.insertJoin(member);
        return result;
    }

    //로그인 로직 
    public LoginMember selectOneMember(Member member) {
        Member loginMember = memberDao.selectOneMember(member.getMemberId());
        System.out.println("loginMember:"+loginMember);
        if(loginMember != null) {
            if(bcrypt.matches(member.getMemberPw(), loginMember.getMemberPw())) {
                LoginMember login = jwtUtils.createToken(loginMember.getMemberNo(), loginMember.getMemberId(),loginMember.getMemberNickname(),loginMember.getMemberRole());
                System.out.println(333333333);
                return login;
            }
            loginMember.setMemberStatus(loginMember.getMemberStatus());
            loginMember.setMemberEmail(loginMember.getMemberEmail());
            System.out.println(44444);
        }


    return null;
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
        Integer result = memberDao.existByIdAndEmail(memberId,memberEmail);
        if(result != null && result>0){
            return  true;
        }
        return false;
    }
}