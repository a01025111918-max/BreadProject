package com.example.Bread_project.order.model.dao;

import com.example.Bread_project.bread.vo.Bread;
import com.example.Bread_project.order.model.vo.AccountLog;
import com.example.Bread_project.order.model.vo.Order;
import org.apache.ibatis.annotations.Mapper;

/*
 * OrderDao
 *
 * 주문/결제와 관련된 DB 작업을 담당하는 MyBatis Mapper 인터페이스.
 *
 * 이 인터페이스의 메서드 이름은
 * order-mapper.xml의 id 값과 1:1로 연결된다.
 *
 * 예:
 * int insertOrder(Order order);
 * ↓
 * <insert id="insertOrder">
 */
@Mapper
public interface OrderDao {

    /*
     * 회원의 현재 가상계좌 잔액 조회
     *
     * 사용 위치:
     * - 결제 후 balance_after 저장
     * - 잔액 확인 로직
     *
     * memberNo를 기준으로 member_account_tbl에서 balance를 조회한다.
     */
    int selectBalance(Integer memberNo);

    /*
     * 주문할 빵 정보 조회
     *
     * 프론트에서는 breadNo와 주문 수량만 넘어오기 때문에,
     * 실제 가격 계산을 위해 DB에서 breadPrice를 조회해야 한다.
     *
     * 사용 위치:
     * - totalPrice = breadPrice * orderCount 계산
     */
    Bread selectOneBread(Integer breadNo);

    /*
     * 구매자 가상계좌 잔액 차감
     *
     * 주문 총액(totalPrice)만큼 구매자의 balance를 감소시킨다.
     *
     * 보통 mapper에서는:
     * WHERE member_no = #{memberNo}
     * AND balance >= #{totalPrice}
     *
     * 조건을 걸어 잔액 부족 시 update가 안 되도록 만든다.
     *
     * 반환값:
     * 1 = 차감 성공
     * 0 = 잔액 부족 또는 차감 실패
     */
    int minusBalance(Order order);

    /*
     * 사이트 계좌 잔액 증가
     *
     * 구매자에게서 차감된 금액을
     * site_account_tbl의 사이트 계좌에 더한다.
     *
     * 현재 구조에서는 판매자 회원이 따로 있는 게 아니라,
     * 빵판매 사이트 계좌(account_no = 1)로 입금되는 방식이다.
     *
     * 반환값:
     * 1 = 입금 성공
     * 0 = 입금 실패
     */
    int plusSellerBalance(Order order);

    /*
     * 주문 정보 저장
     *
     * order_tbl에 주문 정보를 insert한다.
     *
     * 중요한 점:
     * account_log_tbl에는 order_no가 필요하므로
     * 결제/로그 처리 전에 주문을 먼저 생성한다.
     *
     * mapper에서 selectKey를 사용하면
     * order_seq.NEXTVAL로 생성된 orderNo가
     * Order 객체에 다시 세팅된다.
     *
     * 반환값:
     * 1 = 주문 생성 성공
     * 0 = 주문 생성 실패
     */
    int insertOrder(Order order);

    /*
     * 회원의 가상계좌 번호 조회
     *
     * account_log_tbl에 PAYMENT 로그를 남길 때
     * 어떤 계좌에서 돈이 빠져나갔는지 기록하기 위해 사용한다.
     *
     * memberNo를 기준으로 account_no를 조회한다.
     */
    Integer selectAccountNo(Integer memberNo);

    /*
     * 거래 로그 저장
     *
     * account_log_tbl에 PAYMENT / DEPOSIT 로그를 insert한다.
     *
     * PAYMENT:
     * - 구매자 계좌에서 돈이 빠진 기록
     * - member_no 있음
     *
     * DEPOSIT:
     * - 사이트 계좌로 돈이 들어온 기록
     * - site_account_tbl 기준이므로 member_no는 null 가능
     *
     * 반환값:
     * 1 = 로그 저장 성공
     * 0 = 로그 저장 실패
     */
    int insertAccountLog(AccountLog paymentLog);

    /*
     * 사이트 계좌 현재 잔액 조회
     *
     * DEPOSIT 로그의 balance_after 값을 저장하기 위해 사용한다.
     *
     * 예:
     * 사이트 계좌 기존 잔액 44300원
     * 입금 금액 4000원
     * 입금 후 잔액 48300원
     *
     * 이 48300원을 account_log_tbl.balance_after에 저장한다.
     */
    Integer selectSiteBalance(Integer accountNo);

    /*
     * 빵 재고 차감
     *
     * breadNo를 기준으로 주문한 빵을 찾고,
     * orderCount만큼 bread_stock을 감소시킨다.
     *
     * 반환값:
     * 1 = 재고 차감 성공
     * 0 = 재고 부족 또는 차감 실패
     */
    int minusBreadStock(Order order);
    // Select the completed order that the logged-in member can cancel.
    Order selectCancelableOrder(Order order);

    // Change order_status from COMPLETED to CANCEL.
    int cancelOrder(Order order);

    // Put the canceled order count back into bread stock.
    int restoreBreadStock(Order order);
}
