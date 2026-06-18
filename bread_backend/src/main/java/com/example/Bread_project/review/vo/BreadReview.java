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
    private Integer reviewNo;
    private Integer orderNo;
    private Integer breadNo;
    private Integer memberNo;
    private String nickname;
    private Double rating;
    private String reviewContent;
    private String reviewStatus;
    private Date createdDate;
    private Date updatedDate;
    private Double averageRating;
    private Integer reviewCount;
}
