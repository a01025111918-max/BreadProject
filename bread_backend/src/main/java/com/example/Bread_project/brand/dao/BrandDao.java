package com.example.Bread_project.brand.dao;

import com.example.Bread_project.brand.vo.Brand;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BrandDao {
    List<Brand> selectBrandList();

    Brand selectOneBrand(int brandNo);
}
