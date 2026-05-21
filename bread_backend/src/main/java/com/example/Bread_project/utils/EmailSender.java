package com.example.Bread_project.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.Date;

@Component
public class EmailSender {
    @Autowired
    private JavaMailSender sender;

    public void sendMail(String emailTitle, String receiver, String emailContent){
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try{
            helper.setSentDate(new Date());
            //보내는 사람 정보
            helper.setFrom(new InternetAddress("tkavkf30409@gmail.com", "탄소커넥트"));
            //받는 사람 정보
            helper.setTo(receiver);
            //제목 설정
            helper.setSubject(emailTitle);
            //내용설정
            helper.setText(emailContent, true);
            //이메일 전송
            sender.send(message);
        } catch (UnsupportedEncodingException e){
            e.printStackTrace();
        } catch (MessagingException e){
            System.out.println("메일 전송 실패:" + e.getMessage());

        }

    }


}
