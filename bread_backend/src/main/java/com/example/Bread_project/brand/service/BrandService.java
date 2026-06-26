package com.example.Bread_project.brand.service;

import com.example.Bread_project.brand.dao.BrandDao;
import com.example.Bread_project.brand.vo.Brand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {
    @Autowired
    private BrandDao brandDao;

    // 브랜드 소개 목록 전체 조회 로직
    // 단순 조회이므로 @Transactional을 사용하지 않는다.
    public List<Brand> selectBrandList() {
        List<Brand> brandList = brandDao.selectBrandList();
        return brandList;
    }

    // 브랜드 상세 조회 로직
    // 단순 조회이므로 @Transactional을 사용하지 않는다.
    public Brand selectOneBrand(int brandNo) {
        Brand brand = brandDao.selectOneBrand(brandNo);
        return brand;
    }
}
