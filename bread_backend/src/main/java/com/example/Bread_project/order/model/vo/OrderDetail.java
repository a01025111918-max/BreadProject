package com.example.Bread_project.order.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
//빵 상세조회 --> 빵이 한두개가 아닌 다량으로 구매했을 떄 관리 차원에서 필요한 로직
public class OrderDetail {
    private int orderDetailNo;

    private int orderNo;

    private int breadNo;

    private String breadName;

    private int breadPrice;

    private int orderCount;
}
