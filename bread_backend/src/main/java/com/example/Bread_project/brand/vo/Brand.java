package com.example.Bread_project.brand.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "brand")
public class Brand {
    private int brandNo;
    private String brandName;
    private String brandContent;
    private String breadName;
}
