package com.example.Bread_project.admin.model.service;

import com.example.Bread_project.admin.model.dao.AdminDao;
import com.example.Bread_project.admin.model.vo.AdminOrder;
import com.example.Bread_project.admin.model.vo.AdminStock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {
    @Autowired
    private AdminDao adminDao;

    public List<AdminOrder> selectPaidOrders() {
        // 관리자 페이지에 보여줄 주문 완료 목록을 DAO에서 조회한다.
        return adminDao.selectPaidOrders();
    }

    public List<AdminOrder> selectCancelOrders() {
        // 관리자 페이지에 보여줄 주문 취소 목록을 DAO에서 조회한다.
        return adminDao.selectCancelOrders();
    }

    public List<AdminStock> selectAdminStocks() {
        // 관리자 페이지에서 보여줄 전체 빵 재고 목록을 DAO에서 조회한다.
        return adminDao.selectAdminStocks();
    }

    @Transactional
    public int completeOneCancelOrder(Integer orderNo, Integer adminNo) {
        // 취소 요청 상태인 주문 1건만 먼저 조회한다.
        AdminOrder order = adminDao.selectCancelRequestOrder(orderNo);

        if (order == null) {
            throw new IllegalArgumentException("승인할 수 있는 취소 요청 주문이 없습니다.");
        }

        // 주문 상태를 CANCEL_COMPLETE로 바꾸고 승인 관리자 번호를 저장한다.
        int orderResult = adminDao.completeCancelOrder(order.getOrderNo(), adminNo);

        if (orderResult == 0) {
            throw new RuntimeException("주문 취소 승인에 실패했습니다.");
        }

        // 승인된 주문 수량만큼 빵 재고를 복구한다.
        int stockResult = adminDao.restoreBreadStock(order.getBreadNo(), order.getOrderCount());

        if (stockResult == 0) {
            throw new RuntimeException("재고 복구에 실패했습니다.");
        }

        return 1;
    }

    @Transactional
    public int completeCancelOrders(Integer adminNo) {
        // 취소 요청 상태인 주문만 먼저 조회한다.
        List<AdminOrder> cancelRequestList = adminDao.selectCancelRequestOrders();

        if (cancelRequestList.isEmpty()) {
            return 0;
        }

        int completeCount = 0;

        for (AdminOrder order : cancelRequestList) {
            // 주문 상태를 CANCEL_COMPLETE로 바꾸고 승인 관리자 번호를 저장한다.
            int orderResult = adminDao.completeCancelOrder(order.getOrderNo(), adminNo);

            // 주문 상태 변경이 성공했을 때만 재고를 복구한다.
            if (orderResult > 0) {
                int stockResult = adminDao.restoreBreadStock(order.getBreadNo(), order.getOrderCount());

                if (stockResult == 0) {
                    throw new RuntimeException("재고 복구에 실패했습니다.");
                }

                completeCount++;
            }
        }

        return completeCount;
    }
}
