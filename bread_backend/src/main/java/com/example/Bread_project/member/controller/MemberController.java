package com.example.Bread_project.member.controller;


import com.example.Bread_project.member.dto.MemberResponse;
import com.example.Bread_project.member.model.dao.MemberDao;
import com.example.Bread_project.member.model.service.MemberService;
import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.member.model.vo.Member;
import com.example.Bread_project.utils.EmailSender;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(value = "/members")
public class MemberController {
    @Autowired
    private MemberDao memberDao;
    @Autowired
    private MemberService memberService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private EmailSender emailSender;

    //회원가입
    @PostMapping
    public ResponseEntity<?> join(@RequestBody Member member) {
        int result = memberService.insertJoin(member);
        if (result == 1) {
            return ResponseEntity.ok("회원가입 성공");
        } else {
            return ResponseEntity.ok("회원가입 실패");
        }

    }

    // 아이디 중복체크 설정
    @GetMapping(value = "/check-id")
    public ResponseEntity<?> dupCheckId(@RequestParam String memberId) {
        //기존 selectOneMember(memberId)에서는 Member member로 전체를 받아오는
        //-> 로직을 짰기 떄문에 다시 재사용할 경우 문제가 터짐
        //-> 왜냐하면 여기에서는 memberId하나로 조회하기 때문.
        //-> 따라서 메서드명을 바꿔야 함
        boolean isDuplicate = memberService.selectOneMemberId(memberId);

        return ResponseEntity.ok(isDuplicate);
    }


    //로그인
    @PostMapping(value = "/login")
    public ResponseEntity<?> Login(@RequestBody Member member) {
        //로그인 요청을 한 회원의 정보가 실제로 데이터 베이스에 존재하는 지를 알려는 것이기 떄문에
        //--> 로직을 m에 다 담아서 리엑트로 보냄.
        LoginMember m = memberService.selectOneMember(member);
        if (m == null) {
            return ResponseEntity.status(401).body("로그인에 실패하였습니다");
        }

        //로그인을 통해 받아온 정보에서 필요한 것만 리엑트로 보내고 나머지는 차단하기
        //-> 백엔드에서 사전 차단.
        MemberResponse res = new MemberResponse(
                m.getMemberId(),
                m.getMemberName(),
                m.getMemberNickname(),
                m.getMemberRole(),
                m.getToken(),
                m.getEndTime(),
                m.getMemberNo()

        );
        return ResponseEntity.ok(res);
    }

    // 재토큰을 받아 로그인 연장 구현 로직
    @PostMapping(value = "/refresh")
    public ResponseEntity<?> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("토큰이 없습니다.");
        }

        String token = authorization.replace("Bearer ", "");
        LoginMember m = memberService.refreshToken(token);

        if (m == null) {
            return ResponseEntity.status(401).body("토큰 연장에 실패했습니다.");
        }

        MemberResponse res = new MemberResponse(
                m.getMemberId(),
                m.getMemberName(),
                m.getMemberNickname(),
                m.getMemberRole(),
                m.getToken(),
                m.getEndTime(),
                m.getMemberNo()

        );

        return ResponseEntity.ok(res);
    }


    // 아이디 찾기 설정(김경건)
    @PostMapping(value = "/find-id")
    public ResponseEntity<?> findId(@RequestBody Member member) {
        // 아이디 하나로 회원 전체 정보를 가져오는게 아니기떄문에
        // 여기서는 이메일 인증을 통해 아이디 하나만을 조회하는 것이기 떄문에
        // String memberId로 처리
        String memberId = memberService.findIdByEmail(member.getMemberEmail());

        if (memberId != null) {
            String title = "아이디 찾기 결과";
            String content = "<h3>회원님의 아이디는 </h3><h2>" + memberId + "</h2>입니다.";

            emailSender.sendMail(title, member.getMemberEmail(), content);

            // 이메일로 아이디를 보냈기 떄문에 굳이 프런트에 아이디를 줄 필요없음
            // 따라서 리턴할 값을 주지않고 공백처리 해도됨.
            // 하지만 json형태로 데이터가 오기 떄문에 객체 형태로 변환하기 위해서는
            // map형태를 쓰는게 좋음.
            // 그리고 Map.of()를 쓰면 키-값 쌍으로 여러 데이터를 쉽게 묶어서 반환 가능
            // 객체 클래스를 만들지 않아도 여러 필드를 한번에 보내기 좋음
            return ResponseEntity.ok(Map.of("message", "이메일로 아이디를 전송했습니다."

            ));

        } else {
            return ResponseEntity.status(404).body("아이디를 찾을 수 없습니다.");
        }
    }

    //비밀번호 찾기 페이지
    @PostMapping(value = "/find-pw")
    public ResponseEntity<?> findPw(@RequestBody Member member) {
        String memberId = member.getMemberId();
        String memberEmail = member.getMemberEmail();

        boolean result = memberService.existByIdAndEmail(memberId, memberEmail);

        if (result) {
            String title = "비밀번호 재설정 안내";
            String content = "<h3>비밀번호를 재설정하려면 아래 링크를 클릭하세요</h3>"
                    + "<a href='http://localhost:5174/members/reset-pw?memberId=" + member.getMemberId()
                    + "'>비밀번호 재설정하기</a>";

            emailSender.sendMail(title, member.getMemberEmail(), content);
            return ResponseEntity.ok(Map.of("message", "비밀번호 재설정 링크를 이메일로 전송했습니다."));
        } else {
            return ResponseEntity.status(404).body("아이디와 이메일이 일치하지 않습니다.");
        }
    }

    // 비밀번호 재설정 로직
    @PostMapping(value = "/reset-pw")
    public ResponseEntity<?> resetPw(@RequestBody Member member) {
        int result = memberService.resetPw(member);

        if (result > 0) {
            return ResponseEntity.ok("SUCCESS");
        }

        return ResponseEntity.status(404).body("아이디를 찾을 수 없습니다.");
    }


}
