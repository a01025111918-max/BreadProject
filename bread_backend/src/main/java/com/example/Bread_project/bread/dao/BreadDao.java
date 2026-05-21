package com.example.Bread_project.bread.dao;

import com.example.Bread_project.bread.vo.Bread;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BreadDao {
    //빵 전체 조회 목록
    List<Bread> selectBreadList();

    Bread selectOneBread(int breadNo);
}
