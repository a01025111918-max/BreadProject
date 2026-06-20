package com.example.Bread_project.review.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "breadReview")
public class BreadReview {
    // 후기 번호
    private Integer reviewNo;
    // 후기를 작성할 수 있게 만든 주문 번호
    private Integer orderNo;
    // 후기가 달린 빵 번호
    private Integer breadNo;
    // 후기를 작성한 회원 번호
    private Integer memberNo;
    // 화면에 보여줄 작성자 닉네임
    private String nickname;
    // 사용자가 선택한 별점
    private Double rating;
    // 사용자가 작성한 후기 내용
    private String reviewContent;
    // 후기 사용 여부
    private String reviewStatus;
    // 후기 최초 작성일
    private Date createdDate;
    // 후기 마지막 수정일
    private Date updatedDate;
    // 평균 별점 조회용 보조 값
    private Double averageRating;
    // 후기 개수 조회용 보조 값
    private Integer reviewCount;
}