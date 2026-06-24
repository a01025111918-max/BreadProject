package com.example.Bread_project.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "adminStock")
public class AdminStock {
    private Integer breadNo;
    private String breadName;
    private Integer breadPrice;
    private Integer breadStock;
    private String breadCategory;
    private String breadStatus;
    private String breadThumb;
}
