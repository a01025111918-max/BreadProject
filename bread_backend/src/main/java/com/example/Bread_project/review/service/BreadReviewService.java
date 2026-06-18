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

    public List<BreadReview> selectReviewList(Integer breadNo) {
        return breadReviewDao.selectReviewList(breadNo);
    }

    public int insertReview(BreadReview review) {
        return breadReviewDao.insertReview(review);
    }

    public boolean existsBread(Integer breadNo) {
        return breadReviewDao.existsBread(breadNo) > 0;
    }

    public boolean existsMember(Integer memberNo) {
        return breadReviewDao.existsMember(memberNo) > 0;
    }

    public Integer selectReviewableOrderNo(Integer breadNo, Integer memberNo) {
        return breadReviewDao.selectReviewableOrderNo(breadNo, memberNo);
    }

    public Double selectAverageRating(Integer breadNo) {
        Double averageRating = breadReviewDao.selectAverageRating(breadNo);
        return averageRating == null ? 0.0 : averageRating;
    }

    public int selectReviewCount(Integer breadNo) {
        return breadReviewDao.selectReviewCount(breadNo);
    }
}
