package com.example.Bread_project.order.model.service;

import com.example.Bread_project.bread.vo.Bread;
import com.example.Bread_project.order.model.dao.OrderDao;
import com.example.Bread_project.order.model.vo.AccountLog;
import com.example.Bread_project.order.model.vo.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    @Autowired
    private OrderDao orderDao;

    @Transactional
    public int payOrder(Order order) {

        /*
         * 1. 주문한 빵 정보 조회
         *
         * 프론트에서는 breadNo와 orderCount 정도만 넘어온다.
         * 하지만 실제 결제 금액을 계산하려면 DB에 저장된 빵 가격이 필요하다.
         * 그래서 breadNo를 기준으로 bread_tbl에서 빵 정보를 조회한다.
         */
        Bread bread = orderDao.selectOneBread(order.getBreadNo());

        /*
         * 2. 총 결제 금액 계산
         *
         * 빵 1개의 가격 * 주문 수량 = 총 결제 금액
         * 예:
         * 빵 가격 3500원
         * 주문 수량 2개
         * totalPrice = 7000원
         */
        Integer totalPrice = bread.getBreadPrice() * order.getOrderCount();

        /*
         * 3. 계산된 총 결제 금액을 order 객체에 저장
         *
         * order_tbl에 주문 정보를 insert할 때 total_price 컬럼에 들어갈 값이다.
         * 또한 이후 구매자 잔액 차감, 판매자 잔액 증가, 로그 기록에서도 사용된다.
         */
        order.setTotalPrice(totalPrice);

        /*
         * 4. 주문 정보 먼저 저장
         *
         * account_log_tbl에는 order_no가 반드시 필요하다.
         * 그래서 잔액을 차감하기 전에 먼저 order_tbl에 주문 정보를 insert한다.
         *
         * insertOrder 내부에서는 order_seq.NEXTVAL로 주문 번호를 생성하고,
         * 생성된 orderNo가 order 객체에 다시 세팅된다.
         */
        int orderResult = orderDao.insertOrder(order);

        /*
         * 5. 주문 insert 결과 확인용 로그
         *
         * orderResult = 1이면 주문 저장 성공
         * order.getOrderNo()에 값이 들어오면 주문 번호 생성 성공
         */
        System.out.println("orderResult = " + orderResult);
        System.out.println("orderNo = " + order.getOrderNo());

        /*
         * 6. 주문 저장 실패 시 예외 발생
         *
         * @Transactional이 붙어 있으므로 RuntimeException이 발생하면
         * 이 메서드 안에서 실행된 DB 작업들이 rollback된다.
         */
        if (orderResult == 0) {
            throw new RuntimeException("주문 생성 실패");
        }

        /*
         * 7. 구매자 계좌 잔액 차감
         *
         * 구매자의 memberNo를 기준으로 가상계좌를 찾고,
         * totalPrice만큼 balance를 감소시킨다.
         *
         * 보통 mapper에서는 조건을 이렇게 잡는다:
         * WHERE member_no = #{memberNo}
         * AND balance >= #{totalPrice}
         *
         * 그래서 잔액이 부족하면 update된 행이 없어서 minusResult가 0이 된다.
         */
        int minusResult = orderDao.minusBalance(order);

        /*
         * 8. 잔액 부족 처리
         *
         * minusResult가 0이면 구매자 잔액 차감 실패.
         * 즉 잔액 부족으로 판단하고 컨트롤러에 0을 반환한다.
         *
         * 현재 코드에서는 return 0이므로 RuntimeException이 아니기 때문에
         * 이미 insert된 order_tbl 데이터는 rollback되지 않을 수 있다.
         *
         * 나중에는 잔액 부족도 주문 저장까지 취소하려면
         * throw new RuntimeException("잔액 부족");
         * 방식으로 바꾸는 것도 고려할 수 있다.
         */

        if (minusResult == 0) {
            //원래는 return =0;이었으나 이럴 경우
            //잔액 부족이면 rollback이 안될 수 있다.
            //주문이 따로 없었을 때는 throw까지 필요가 없었으나
            //-> 주문 로직이 생긴 이후에는 결제가 실패했는데도 주문은
            //-> 생성된 상태가 될 수 있다.
            //-> 그래서 그것을 방지하기 위한 로직이고, 결제가 실패했을 경우
            //->rollback이 되면서 주문 insert까지 취소됨 
            throw new RuntimeException("잔액 부족");
        }

        /*
         * 9. 구매자 결제 로그 객체 생성
         *
         * account_log_tbl에 저장할 거래 기록을 만든다.
         *
         * 이 로그는 구매자 입장에서 돈이 빠져나간 기록이다.
         * 그래서 changeType은 PAYMENT로 저장한다.
         */
        AccountLog paymentLog = new AccountLog();

        /*
         * 10. 어떤 주문 때문에 발생한 거래인지 저장
         *
         * 위에서 insertOrder를 통해 생성된 orderNo를 사용한다.
         * account_log_tbl.order_no에 들어간다.
         */
        paymentLog.setOrderNo(order.getOrderNo());

        /*
         * 11. 구매자의 계좌번호 저장
         *
         * account_log_tbl.account_no에 들어갈 값이다.
         * memberNo를 기준으로 member_account_tbl에서 account_no를 조회한다.
         */
        paymentLog.setAccountNo(
                orderDao.selectAccountNo(order.getMemberNo())
        );

        /*
         * 12. 거래를 발생시킨 회원 번호 저장
         *
         * 구매자가 결제했으므로 구매자의 memberNo를 저장한다.
         */
        paymentLog.setMemberNo(order.getMemberNo());

        /*
         * 13. 거래 유형 저장
         *
         * PAYMENT = 구매자 입장에서 결제/출금
         * DEPOSIT = 판매자 또는 사이트 입장에서 입금
         * REFUND = 환불
         */
        paymentLog.setChangeType("PAYMENT");

        /*
         * 14. 거래 금액 저장
         *
         * 구매자가 실제로 결제한 금액이다.
         */
        paymentLog.setChangeAmount(totalPrice);

        /*
         * 15. 차감 후 잔액 저장
         *
         * minusBalance가 이미 실행된 뒤이므로
         * 여기서 selectBalance를 하면 결제 후 남은 잔액이 조회된다.
         *
         * 예:
         * 기존 잔액 10000원
         * 결제 금액 3500원
         * balanceAfter = 6500원
         */
        paymentLog.setBalanceAfter(
                orderDao.selectBalance(order.getMemberNo())
        );

        /*
         * 16. 구매자 PAYMENT 로그 저장
         *
         * account_log_tbl에 결제 기록을 insert한다.
         */
        int paymentLogResult =
                orderDao.insertAccountLog(paymentLog);

        /*
         * 17. 로그 저장 실패 시 예외 발생
         *
         * 로그 저장 실패는 데이터 무결성에 문제가 생기는 상황이다.
         * 그래서 RuntimeException을 발생시켜 전체 transaction을 rollback시킨다.
         */
        if (paymentLogResult == 0) {
            throw new RuntimeException("결제 로그 저장 실패");
        }

        /*
         * 18. 판매자 또는 사이트 계좌 잔액 증가
         *
         * 구매자에게서 빠져나간 금액을 사이트 계좌에 입금한다.
         */
        int plusResult = orderDao.plusSellerBalance(order);

        /*
         * 19. 사이트 계좌 입금 실패 시 예외 발생
         *
         * 구매자 돈은 빠졌는데 판매자 계좌에 입금이 안 되면
         * 치명적인 문제다.
         *
         * 따라서 RuntimeException으로 전체 작업을 rollback시킨다.
         */
        if (plusResult == 0) {
            throw new RuntimeException("판매자 계좌 입금 실패");
        }

        /*
         * 20. 모든 과정 성공
         *
         * 주문 생성, 구매자 잔액 차감, 결제 로그 저장, 판매자 입금까지 성공.
         */

        /*
         * 20. 사이트(DEPOSIT) 로그 생성
         *
         * account_log_tbl에 사이트 입금 기록 저장.
         *
         * 현재 구조에서는 site_account_tbl이
         * 별도로 존재하므로 member_no 없이 기록한다.
         */
        AccountLog depositLog = new AccountLog();
        /*
         * 어떤 주문 때문에 발생한 입금인지 저장
         */
        depositLog.setOrderNo(order.getOrderNo());

        /*
         * 사이트 계좌 번호 저장
         *
         * 현재 site_account_tbl의 사이트 계좌 번호가
         * 1번이라고 가정.
         */

        depositLog.setAccountNo(1);

        /*
         * 거래 유형

         *
         * DEPOSIT = 사이트 입장에서는 입금
         */

        depositLog.setChangeType("DEPOSIT");

        /*
         * 입금 금액 저장
         */
        depositLog.setChangeAmount(totalPrice);

        /*
         * 입금 후 사이트 계좌 잔액 저장
         *
         * site_account_tbl의 현재 balance 조회
         */
        depositLog.setBalanceAfter(
                orderDao.selectSiteBalance(1)
        );

        /*
         * 사이트 입금 로그 저장
         * 여기에서 memberNo를 null로 처리해야 하는 이유. 아직 관리자로서의 memberNo를 설정해 놓지 않았기에 not null로 해놓으면 반드시 관리자 지정 no를 설정해야 한다.
         * 그런데 아직 관리자 로직을 안만들었음으로 그냥 null로 처리하여 문제 해결
         */
        int depositLogResult = orderDao.insertAccountLog(depositLog);

        /*
         * 로그 저장 실패 시 rollback
         */
        if(depositLogResult == 0){
            throw new RuntimeException("사이트 입금 로그 저장 실패");
        }

        // 재고 수량 반영하는 로직 짜기
        //주문과 결제, 거래 로그까지 정상적으로 처리된 뒤
        // * 실제 구매 수량만큼 bread_tbl의 재고를 감소시키는 로직
        //mapper에서 bread_stock >= orderCount 조건을 걸어


        int stockResult = orderDao.minusBreadStock(order);
        // * 재고 부족 시 update가 실패하도록 만든다.
        if(stockResult == 0){
            throw new RuntimeException("재고 부족");
        }

        return 1;

    }


}

 /*
        * 1. member_account_tbl 조회
          2. balance 확인
          3. totalPrice보다 잔액이 많으면
          4. balance 차감 UPDATE
          * 즉 이 로직은 조회가 아니라 업데이트 이기 떄문에 int를 씀
        */
       /* int balance =
                //사용자의 가상계좌 잔액을 조회하는 과정
                orderDao.selectBalance(
                        order.getMemberNo());

        if(balance < order.getTotalPrice()){
            return 0;
        }
        return 1;
        */
