package com.example.Bread_project.bread.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "bread")
public class Bread {
    private Integer breadNo;
    private String breadName;
    private Integer breadPrice;
    private String breadContent;
    private Integer breadStock;
    private String breadCategory;
    private String breadStatus;
    private String breadThumb;
    private Date createdDate;

}
