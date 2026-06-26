package com.example.Bread_project.brand.controller;

import com.example.Bread_project.brand.service.BrandService;
import com.example.Bread_project.brand.vo.Brand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/brand")
public class BrandController {
    @Autowired
    private BrandService brandService;

    // 브랜드 소개 목록 전체 조회 로직
    @GetMapping
    public ResponseEntity<?> selectBrandList() {
        List<Brand> brandList = brandService.selectBrandList();
        return ResponseEntity.ok(brandList);
    }

    // 브랜드 번호로 브랜드 소개 정보를 조회하는 로직
    @GetMapping(value = "/{brandNo}")
    public ResponseEntity<?> selectOneBrand(@PathVariable int brandNo) {
        Brand brand = brandService.selectOneBrand(brandNo);

        if (brand == null) {
            return ResponseEntity.status(404).body("브랜드 정보를 찾을 수 없습니다.");
        }

        return ResponseEntity.ok(brand);
    }
}
