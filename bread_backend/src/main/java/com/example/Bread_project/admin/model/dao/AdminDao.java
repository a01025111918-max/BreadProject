package com.example.Bread_project.admin.model.dao;

import com.example.Bread_project.admin.model.vo.AdminOrder;
import com.example.Bread_project.admin.model.vo.AdminStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminDao {
    // 관리자 페이지에서 주문 완료 상태인 전체 주문을 조회한다.
    List<AdminOrder> selectPaidOrders();

    // 관리자 페이지에서 주문 취소와 관련된 전체 주문을 조회한다.
    List<AdminOrder> selectCancelOrders();

    // 관리자가 승인해야 할 취소 요청 주문만 조회한다.
    List<AdminOrder> selectCancelRequestOrders();

    // 관리자가 개별 취소 승인할 주문 하나를 조회한다.
    AdminOrder selectCancelRequestOrder(Integer orderNo);

    // 주문 상태를 취소 완료로 변경하고, 승인 관리자 번호와 완료 날짜를 저장한다.
    int completeCancelOrder(@Param("orderNo") Integer orderNo, @Param("adminNo") Integer adminNo);

    // 취소가 승인된 주문 수량만큼 빵 재고를 복구한다.
    int restoreBreadStock(@Param("breadNo") Integer breadNo, @Param("orderCount") Integer orderCount);

    // 관리자 페이지에서 전체 빵 재고를 조회한다.
    List<AdminStock> selectAdminStocks();
}
