package com.example.Bread_project.bread.dao;

import com.example.Bread_project.bread.vo.Bread;
import com.example.Bread_project.bread.vo.BreadDetail;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BreadDao {
    //빵 전체 조회 목록
    List<Bread> selectBreadList();
    //빵 상세 조뢰
    Bread selectOneBread(int breadNo);
    //빵 영양 상세 조회
    BreadDetail selectOneNutrition(int breadNo);
}
