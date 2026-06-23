package com.example.Bread_project.admin.controller;

import com.example.Bread_project.admin.model.service.AdminService;
import com.example.Bread_project.admin.model.vo.AdminOrder;
import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtils jwtUtils;

    // 관리자 주문 완료 목록 조회 로직
    @GetMapping(value = "/orders/paid")
    public ResponseEntity<?> selectPaidOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        LoginMember loginMember = checkAdmin(authorization);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginMember.getMemberRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자만 조회할 수 있습니다.");
        }

        List<AdminOrder> orderList = adminService.selectPaidOrders();
        return ResponseEntity.ok(orderList);
    }


    // 관리자 주문 취소 목록 조회 로직
    @GetMapping(value = "/orders/cancel")
    public ResponseEntity<?> selectCancelOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        LoginMember loginMember = checkAdmin(authorization);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginMember.getMemberRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자만 조회할 수 있습니다.");
        }

        List<AdminOrder> orderList = adminService.selectCancelOrders();
        return ResponseEntity.ok(orderList);
    }
    // 토큰을 확인해서 로그인한 회원 정보를 가져온다.
    private LoginMember checkAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token = authorization.replace("Bearer ", "");
        return jwtUtils.cheakToken(token);
    }


    // 주문 취소 요청을 하나만 승인하는 로직
    @PatchMapping(value = "/orders/cancel/{orderNo}/complete")
    public ResponseEntity<?> completeOneCancelOrder(
            @PathVariable Integer orderNo,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        LoginMember loginMember = checkAdmin(authorization);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginMember.getMemberRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자만 승인할 수 있습니다.");
        }

        try {
            int result = adminService.completeOneCancelOrder(orderNo, loginMember.getMemberNo());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // 주문 취소 요청을 승인하는 로직
    @PatchMapping(value = "/orders/cancel/complete")
    public ResponseEntity<?> completeCancelOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        LoginMember loginMember = checkAdmin(authorization);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginMember.getMemberRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자만 승인할 수 있습니다.");
        }

        int result = adminService.completeCancelOrders(loginMember.getMemberNo());
        return ResponseEntity.ok(result);
    }

}