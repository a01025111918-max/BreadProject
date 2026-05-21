package com.example.Bread_project.order.controller;


import com.example.Bread_project.order.model.service.OrderService;
import com.example.Bread_project.order.model.vo.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> orderMember(@RequestBody Order order ) {
        System.out.println("주문 요청 도착");
        //계좌 잔액 차감, 즉 update로직.
        int result = orderService.payOrder(order);
        System.out.println("result = " + result);

        if (result > 0) {
            return ResponseEntity.ok("결제 성공");
        } else {
            return ResponseEntity.badRequest()
                    .body("잔액 부족");
        }
    }
}