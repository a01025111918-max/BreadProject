package com.example.Bread_project.review.dao;

import com.example.Bread_project.review.vo.BreadReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BreadReviewDao {
    List<BreadReview> selectReviewList(Integer breadNo);

    int insertReview(BreadReview review);

    int existsBread(Integer breadNo);

    int existsMember(Integer memberNo);

    Integer selectReviewableOrderNo(
            @Param("breadNo") Integer breadNo,
            @Param("memberNo") Integer memberNo
    );

    Double selectAverageRating(Integer breadNo);

    int selectReviewCount(Integer breadNo);
}
