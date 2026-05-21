package com.example.Bread_project.order.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "accountLog")
public class AccountLog {
    private Integer logNo;
    private Integer orderNo;
    private Integer accountNo;
    private Integer memberNo;
    private String changeType;
    private Integer changeAmount;
    private Integer balanceAfter;
    private Date logDate;
}
