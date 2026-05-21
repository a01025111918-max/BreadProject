package com.example.Bread_project.member.model.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "member")
public class Member {
    private Integer memberNo;
    private String memberId;
    private String memberPw;
    private String memberName;
    private String memberNickname;
    private String memberPhone;
    private String memberEmail;
    private String memberAddress;
    private String memberRole;
    private String memberStatus;
    private String memberThumb;
    private Date enrollDate;
    private String loginType;
    private String providerId;
    private Date updateDate;
}
