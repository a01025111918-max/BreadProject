package com.example.Bread_project.review.dao;

import com.example.Bread_project.review.vo.BreadReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BreadReviewDao {
    // 특정 빵 번호에 해당하는 후기 목록을 DB에서 조회
    List<BreadReview> selectReviewList(Integer breadNo);

    // 사용자가 작성한 후기를 DB에 insert
    int insertReview(BreadReview review);

    // 기존 후기의 별점과 내용을 DB에서 update
    int updateReview(BreadReview review);

    // 기존 후기의 상태를 N으로 바꿔 화면에서 보이지 않게 처리
    int deleteReview(BreadReview review);

    // 후기 대상 빵이 bread_tbl에 존재하는지 확인
    int existsBread(Integer breadNo);

    // 후기 작성 회원이 member_tbl에 존재하고 활성 상태인지 확인
    int existsMember(Integer memberNo);

    // 구매 내역 중 아직 후기 작성에 사용되지 않은 주문 번호를 조회
    Integer selectReviewableOrderNo(
            @Param("breadNo") Integer breadNo,
            @Param("memberNo") Integer memberNo
    );

    // 특정 빵에 등록된 후기 평균 별점을 조회
    Double selectAverageRating(Integer breadNo);

    // 특정 빵에 등록된 후기 개수를 조회
    int selectReviewCount(Integer breadNo);
}
