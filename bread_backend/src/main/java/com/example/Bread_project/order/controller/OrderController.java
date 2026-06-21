package com.example.Bread_project.order.controller;

import com.example.Bread_project.order.model.service.OrderService;
import com.example.Bread_project.order.model.vo.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> orderMember(@RequestBody Order order) {
        try {
            int result = orderService.payOrder(order);

            if (result > 0) {
                return ResponseEntity.ok("\uC8FC\uBB38 \uC131\uACF5");
            }

            return ResponseEntity.badRequest()
                    .body("\uC8FC\uBB38\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}