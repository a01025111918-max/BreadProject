package com.example.Bread_project.member.controller;

import com.example.Bread_project.member.model.service.MemberService;
import com.example.Bread_project.member.model.vo.Member;
import com.example.Bread_project.utils.EmailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;
import java.util.regex.Pattern;


@RestController
@RequestMapping(value = "members")
public class MailController {
    // 1. 이메일 정규식 패턴을 클래스 상수로 선언 (매번 컴파일하지 않도록 관리)
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");


    @Autowired
    public MemberService memberService;
    @Autowired
    private EmailSender emailSender;

    @PostMapping(value = "/email-verification")
    public ResponseEntity<?> sendEmail(@RequestBody Member m) {

        // 2. 이메일 형식 1차 검증 수행
        String email = m.getMemberEmail();
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            // 형식이 올바르지 않으면 400 Bad Request와 함께 에러 메시지 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("올바르지 않은 이메일 형식입니다.");
        }



        // 3. 검증 통과 후 기존 메일 발송 로직 진행
        String emailTitle = "K&K 빵집 인증 메일입니다.";

        Random r = new Random();
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < 6; i++) {
            int fleg = r.nextInt(3);
            if (fleg == 0) {
                int randomCode = r.nextInt(10);
                sb.append(randomCode);
            } else if (fleg == 1) {
                char randomCode = (char) (r.nextInt(26) + 65);
                sb.append(randomCode);
            } else if (fleg == 2) {
                char randomCode = (char) (r.nextInt(26) + 97);
                sb.append(randomCode);
            }
        }
        String authCode = sb.toString();
        String emailContent = "<h1>인증 번호를 확인하세요</h1>" + "<h3>인증번호는 " + "[<b>" + authCode + "</b>] 입니다. </h3>";
        emailSender.sendMail(emailTitle, m.getMemberEmail(), emailContent);
        return ResponseEntity.ok(authCode);
    }

}
