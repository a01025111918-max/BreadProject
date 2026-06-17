package com.example.Bread_project.bread.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "breadDetail")

//bread_vo에다가 아래 변수들을 다 집어넣을수도 있지만, 그렇게 하면
//-> 로직이 복잡해질 여지가 있기 떄문에 이렇게 다른 vo를 만들어서 관리
public class BreadDetail {
    private int detailId;
    private int breadNo;
    private String servingSize;
    private double caloriesKcal;
    private double calorhydrateG;
    private double sugarG;
    private double proteinG;
    private double fatG;
    private double sodiumMg;
    private String ingredients;
    private String allergyInfo;
    private String detailDescription;
    private Date createdAt;
}
