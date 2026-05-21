package com.example.Bread_project.member.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MemberResponse {
    //로그인해서 전체 정보를 받아 올 때 비밀번호는 제외한 필요한 정보만 받아오게 할
    //로직 설정 DTO
    private String memberId;
    private String memberName;
    private String memberRole;
    private String token;
    private Long endTime;
    private Integer memberNo;
    private String memberNickname;
}
