package com.example.Bread_project.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data

//회원의 가상 계좌
public class MemberAccount {
    private Integer accountNo; // 계좌 번호
    private Integer memberNo; // 회원 번호
    private Integer balance; // 현 계좌 상황
    private String accountStatus; // 계좌 상태
    private Date createDate; //결제 생성일

}
