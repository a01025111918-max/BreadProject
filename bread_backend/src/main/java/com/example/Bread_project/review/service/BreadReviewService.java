package com.example.Bread_project.review.service;

import com.example.Bread_project.review.dao.BreadReviewDao;
import com.example.Bread_project.review.vo.BreadReview;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BreadReviewService {
    @Autowired
    private BreadReviewDao breadReviewDao;

    // 특정 빵 번호에 등록된 후기 목록을 조회하는 로직
    public List<BreadReview> selectReviewList(Integer breadNo) {
        return breadReviewDao.selectReviewList(breadNo);
    }

    // 사용자가 작성한 후기를 DB에 새로 등록하는 로직
    public int insertReview(BreadReview review) {
        return breadReviewDao.insertReview(review);
    }

    // 사용자가 수정한 별점과 후기 내용을 기존 후기 위에 덮어쓰는 로직
    public int updateReview(BreadReview review) {
        review.setReviewContent(review.getReviewContent().trim());
        return breadReviewDao.updateReview(review);
    }

    // 사용자가 본인이 작성한 후기를 삭제 상태로 바꾸는 로직
    public int deleteReview(BreadReview review) {
        return breadReviewDao.deleteReview(review);
    }

    // 후기 작성 또는 조회 대상인 빵이 실제로 존재하는지 확인하는 로직
    public boolean existsBread(Integer breadNo) {
        return breadReviewDao.existsBread(breadNo) > 0;
    }

    // 후기 작성 요청을 보낸 회원이 실제로 존재하고 활성 상태인지 확인하는 로직
    public boolean existsMember(Integer memberNo) {
        return breadReviewDao.existsMember(memberNo) > 0;
    }

    // 아직 후기를 작성하지 않은 주문 건이 있는지 확인하고, 작성 가능한 주문 번호를 가져오는 로직
    public Integer selectReviewableOrderNo(Integer breadNo, Integer memberNo) {
        return breadReviewDao.selectReviewableOrderNo(breadNo, memberNo);
    }

    // 특정 빵에 등록된 후기들의 평균 별점을 계산하는 로직
    public Double selectAverageRating(Integer breadNo) {
        Double averageRating = breadReviewDao.selectAverageRating(breadNo);
        return averageRating == null ? 0.0 : averageRating;
    }

    // 특정 빵에 등록된 후기 개수를 계산하는 로직
    public int selectReviewCount(Integer breadNo) {
        return breadReviewDao.selectReviewCount(breadNo);
    }
}
