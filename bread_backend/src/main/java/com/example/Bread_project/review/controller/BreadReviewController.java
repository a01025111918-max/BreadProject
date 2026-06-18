package com.example.Bread_project.review.controller;

import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.review.service.BreadReviewService;
import com.example.Bread_project.review.vo.BreadReview;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/breads/{breadNo}/reviews")
public class BreadReviewController {
    @Autowired
    private BreadReviewService breadReviewService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<?> selectReviewList(@PathVariable Integer breadNo) {
        if (!breadReviewService.existsBread(breadNo)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 빵을 찾을 수 없습니다.");
        }

        List<BreadReview> list = breadReviewService.selectReviewList(breadNo);
        Double averageRating = breadReviewService.selectAverageRating(breadNo);
        int reviewCount = breadReviewService.selectReviewCount(breadNo);

        Map<String, Object> result = new HashMap<>();
        result.put("reviews", list);
        result.put("averageRating", averageRating);
        result.put("reviewCount", reviewCount);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> insertReview(
            @PathVariable Integer breadNo,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody BreadReview review
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        String token = authorization.replace("Bearer ", "");
        LoginMember loginMember = jwtUtils.cheakToken(token);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("유효하지 않은 로그인 정보입니다.");
        }

        if (review.getMemberNo() == null || !review.getMemberNo().equals(loginMember.getMemberNo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("로그인한 회원 정보와 요청 회원 정보가 일치하지 않습니다.");
        }

        if (!breadReviewService.existsBread(breadNo)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 빵을 찾을 수 없습니다.");
        }

        if (!breadReviewService.existsMember(review.getMemberNo())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 회원을 찾을 수 없습니다.");
        }

        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest()
                    .body("별점은 1점 이상 5점 이하로 선택해주세요.");
        }

        if (review.getReviewContent() == null || review.getReviewContent().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("리뷰 내용을 입력해주세요.");
        }

        Integer reviewableOrderNo = breadReviewService.selectReviewableOrderNo(
                breadNo,
                review.getMemberNo()
        );

        if (reviewableOrderNo == null) {
            return ResponseEntity.badRequest()
                    .body("리뷰를 작성할 수 있는 구매 내역이 없습니다.");
        }

        review.setBreadNo(breadNo);
        review.setOrderNo(reviewableOrderNo);
        review.setReviewContent(review.getReviewContent().trim());

        int result = breadReviewService.insertReview(review);

        if (result > 0) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("리뷰가 등록되었습니다.");
        }

        return ResponseEntity.badRequest()
                .body("리뷰 등록에 실패했습니다.");
    }
}
