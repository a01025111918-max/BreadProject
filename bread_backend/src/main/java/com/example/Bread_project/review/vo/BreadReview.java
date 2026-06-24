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
    // ?꾧린 踰덊샇
    private Integer reviewNo;
    // ?꾧린瑜??묒꽦?????덇쾶 留뚮뱺 二쇰Ц 踰덊샇
    private Integer orderNo;
    // ?꾧린媛 ?щ┛ 鍮?踰덊샇
    private Integer breadNo;
    // ?꾧린瑜??묒꽦???뚯썝 踰덊샇
    private Integer memberNo;
    // ?붾㈃??蹂댁뿬以??묒꽦???됰꽕??
    private String nickname;
    // ?ъ슜?먭? ?좏깮??蹂꾩젏
    private Double rating;
    // ?ъ슜?먭? ?묒꽦???꾧린 ?댁슜
    private String reviewContent;
    // ?꾧린 ?ъ슜 ?щ?
    private String reviewStatus;
    // ?꾧린 理쒖큹 ?묒꽦??
    private Date createdDate;
    // ?꾧린 留덉?留??섏젙??
    private Date updatedDate;
    // ?됯퇏 蹂꾩젏 議고쉶??蹂댁“ 媛?
    private Double averageRating;
    // ?꾧린 媛쒖닔 議고쉶??蹂댁“ 媛?
    private Integer reviewCount;
}
