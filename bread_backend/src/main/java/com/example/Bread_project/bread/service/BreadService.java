package com.example.Bread_project.bread.service;

import com.example.Bread_project.bread.dao.BreadDao;
import com.example.Bread_project.bread.vo.Bread;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BreadService {
    @Autowired
    private BreadDao breadDao;

    //빵 전체 조회 목록
    public List<Bread> selectBreadList() {
        List<Bread> list = breadDao.selectBreadList();
        return list;
    }

    //빵 하나 상세 조회
    public Bread selectOneBread(int breadNo) {
        Bread bread = breadDao.selectOneBread(breadNo);
        return bread;
    }


}
