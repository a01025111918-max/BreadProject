package com.example.Bread_project.order.controller;

import com.example.Bread_project.member.model.vo.LoginMember;
import com.example.Bread_project.order.model.service.OrderService;
import com.example.Bread_project.order.model.vo.Order;
import com.example.Bread_project.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtils jwtUtils;

    // Create order logic.
    @PostMapping
    public ResponseEntity<?> orderMember(@RequestBody Order order) {
        try {
            int result = orderService.payOrder(order);

            if (result > 0) {
                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("message", "\uC8FC\uBB38 \uC131\uACF5");
                resultMap.put("orderNo", order.getOrderNo());
                resultMap.put("orderCount", order.getOrderCount());
                return ResponseEntity.ok(resultMap);
            }

            return ResponseEntity.badRequest()
                    .body("\uC8FC\uBB38\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Order cancel logic.
    @PatchMapping(value = "/{orderNo}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Integer orderNo,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) Order cancelRequest
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
        }

        String token = authorization.replace("Bearer ", "");
        LoginMember loginMember = jwtUtils.cheakToken(token);

        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uB85C\uADF8\uC778 \uC815\uBCF4\uC785\uB2C8\uB2E4.");
        }

        try {
            Order order = new Order();
            order.setOrderNo(orderNo);
            order.setMemberNo(loginMember.getMemberNo());

            if (cancelRequest != null) {
                order.setCancelReason(cancelRequest.getCancelReason());
            }

            int result = orderService.cancelOrder(order);

            if (result > 0) {
                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("message", "\uC8FC\uBB38 \uCDE8\uC18C \uC694\uCCAD \uC131\uACF5");
                resultMap.put("orderNo", orderNo);
                return ResponseEntity.ok(resultMap);
            }

            return ResponseEntity.badRequest()
                    .body("\uC8FC\uBB38 \uCDE8\uC18C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}