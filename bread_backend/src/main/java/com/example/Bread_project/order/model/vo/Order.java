package com.example.Bread_project.order.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "order")
public class Order {
    private Integer orderNo;

    private Integer memberNo;
    private  Integer totalPrice;
    private  String orderStatus;
    private Date orderDate;

    //추가

    private Integer breadNo;
    private Integer orderCount;

    // Cancel request date
    private Date cancelRequestedAt;
    // Cancel complete date
    private Date cancelCompletedAt;
    // Cancel reason written by user
    private String cancelReason;
    // Admin member number that approved cancel
    private Integer cancelAdminNo;
}
