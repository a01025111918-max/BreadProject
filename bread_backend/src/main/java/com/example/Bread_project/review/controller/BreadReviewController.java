package com.example.Bread_project.review.controller;

import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.review.service.BreadReviewService;
import com.example.Bread_project.review.vo.BreadReview;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    // 후기 목록, 평균 별점, 후기 개수, 현재 로그인 회원의 후기 작성 가능 여부를 조회하는 로직
    @GetMapping
    public ResponseEntity<?> selectReviewList(
            @PathVariable Integer breadNo,
            //required = false==> 로그인 안 한 사람도 리뷰 목록은 볼 수 있음
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (!breadReviewService.existsBread(breadNo)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 빵을 찾을 수 없습니다.");
        }

        List<BreadReview> list = breadReviewService.selectReviewList(breadNo);
        Double averageRating = breadReviewService.selectAverageRating(breadNo);
        int reviewCount = breadReviewService.selectReviewCount(breadNo);
        boolean canWriteReview = false;

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.replace("Bearer ", "");
            LoginMember loginMember = jwtUtils.cheakToken(token);

            if (loginMember != null) {
                Integer reviewableOrderNo = breadReviewService.selectReviewableOrderNo(
                        breadNo,
                        loginMember.getMemberNo()
                );
                canWriteReview = reviewableOrderNo != null;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reviews", list);
        result.put("averageRating", averageRating);
        result.put("reviewCount", reviewCount);
        result.put("canWriteReview", canWriteReview);

        return ResponseEntity.ok(result);
    }

    // 후기 등록 로직
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

    // 후기 수정 로직
    @PatchMapping(value = "/{reviewNo}")
    public ResponseEntity<?> updateReview(
            @PathVariable Integer breadNo,
            @PathVariable Integer reviewNo,
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
                    .body("본인이 작성한 후기만 수정할 수 있습니다.");
        }

        if (!breadReviewService.existsBread(breadNo)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 빵을 찾을 수 없습니다.");
        }

        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest()
                    .body("별점은 1점 이상 5점 이하로 선택해주세요.");
        }

        if (review.getReviewContent() == null || review.getReviewContent().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("리뷰 내용을 입력해주세요.");
        }

        review.setBreadNo(breadNo);
        review.setReviewNo(reviewNo);
        review.setMemberNo(loginMember.getMemberNo());

        int result = breadReviewService.updateReview(review);

        if (result > 0) {
            return ResponseEntity.ok("후기가 수정되었습니다.");
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("수정할 수 있는 후기가 없습니다.");
    }

    // 후기 삭제 로직
    @DeleteMapping(value = "/{reviewNo}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer breadNo,
            @PathVariable Integer reviewNo,
            @RequestHeader(value = "Authorization", required = false) String authorization
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

        if (!breadReviewService.existsBread(breadNo)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 빵을 찾을 수 없습니다.");
        }

        BreadReview deleteTarget = new BreadReview();
        deleteTarget.setBreadNo(breadNo);
        deleteTarget.setReviewNo(reviewNo);
        deleteTarget.setMemberNo(loginMember.getMemberNo());

        int result = breadReviewService.deleteReview(deleteTarget);

        if (result > 0) {
            return ResponseEntity.ok("후기가 삭제되었습니다.");
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("삭제할 수 있는 후기가 없습니다.");
    }
}