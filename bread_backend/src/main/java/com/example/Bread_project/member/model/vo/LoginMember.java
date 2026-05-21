package com.example.Bread_project.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
//토큰 즉 출입증에 담길 정보 목록 클래스 생성
public class LoginMember {
    private String token;
    private Integer memberNo;
    private String memberId;
    private String memberNickname;
    private String memberName;
    private String memberRole;
    private String memberThumb;
    private String memberStatus;
    private Long endTime;
}
