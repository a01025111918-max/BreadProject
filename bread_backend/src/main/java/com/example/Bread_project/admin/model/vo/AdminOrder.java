package com.example.Bread_project.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "adminOrder")
public class AdminOrder {
    private Integer orderNo;
    private Integer memberNo;
    private String memberId;
    private String memberNickname;
    private Integer breadNo;
    private String breadName;
    private Integer orderCount;
    private Integer totalPrice;
    private String orderStatus;
    private Date orderDate;
}