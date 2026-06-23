import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./MyPage.module.css";
import useAuthStore from "../authstore/useAuthStore";

const MyPage = () => {
  const navigate = useNavigate();

  // authStore에서 로그인한 회원의 기본 정보를 가져온다.
  const { isReady, memberId, memberNickname, memberThumb } = useAuthStore(
    (state) => state,
  );

  // 현재 선택한 사이드 메뉴를 저장한다.
  const [activeMenu, setActiveMenu] = useState("info");

  // 마이페이지에서 보여줄 주문 목록을 저장한다.
  const [orderList, setOrderList] = useState([]);

  // 프로필 이미지가 없을 때 사용할 기본 이미지이다.
  const profileImg = memberThumb ? memberThumb : "/images/default_image.png";

  // 로그인하지 않은 사용자가 마이페이지에 들어오면 로그인 페이지로 보낸다.
  useEffect(() => {
    if (isReady && !memberId) {
      Swal.fire({
        title: "로그인 후 이용 가능합니다.",
        text: "로그인 화면으로 이동합니다.",
        icon: "warning",
      }).then(() => {
        navigate("/members/login");
      });
    }
  }, [isReady, memberId, navigate]);

  // 로그인한 회원의 주문 목록을 백엔드에서 가져온다.
  useEffect(() => {
    if (!memberId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/orders/my`)
      .then((res) => {
        setOrderList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [memberId]);

  // 주문 상태가 PAID인 주문만 주문 완료 목록에 보여준다.
  const paidOrders = orderList.filter((order) => order.orderStatus === "PAID");

  // 주문 상태가 취소와 관련된 주문만 주문 취소 목록에 보여준다.
  const cancelOrders = orderList.filter(
    (order) =>
      order.orderStatus === "CANCEL_REQUEST" ||
      order.orderStatus === "CANCEL_COMPLETE" ||
      order.orderStatus === "REFUND_COMPLETE",
  );

  // 현재 선택한 메뉴에 따라 오른쪽 내용을 바꿔서 보여준다.
  const renderContent = () => {
    switch (activeMenu) {
      case "info":
        return (
          <MyInfo
            profileImg={profileImg}
            memberId={memberId}
            memberNickname={memberNickname}
          />
        );
      case "paid":
        return <OrderList title="주문 완료" orders={paidOrders} />;
      case "cancel":
        return <OrderList title="주문 취소" orders={cancelOrders} />;
      default:
        return null;
    }
  };

  return (
    <section className={styles.mypage_wrap}>
      {/* 왼쪽 사이드 영역 */}
      <aside className={styles.mypage_aside}>
        {/* 프로필 영역 */}
        <div className={styles.profile_box}>
          <div className={styles.profile_img_box}>
            <img src={profileImg} alt="프로필 이미지" />
          </div>
          <strong>{memberNickname || memberId}</strong>
          <p>{memberId}</p>
        </div>

        {/* 사이드 메뉴 영역 */}
        <nav className={styles.side_menu}>
          <button
            type="button"
            className={activeMenu === "info" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("info")}
          >
            회원 정보
          </button>

          <button
            type="button"
            className={activeMenu === "paid" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("paid")}
          >
            주문 완료
          </button>

          <button
            type="button"
            className={activeMenu === "cancel" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("cancel")}
          >
            주문 취소
          </button>

          <button
            type="button"
            className={styles.home_btn}
            onClick={() => navigate("/")}
          >
            HOME
          </button>
        </nav>
      </aside>

      {/* 오른쪽 내용 영역 */}
      <main className={styles.mypage_content}>{renderContent()}</main>
    </section>
  );
};

// 회원의 기본 정보만 간단하게 보여주는 컴포넌트이다.
const MyInfo = ({ profileImg, memberId, memberNickname }) => {
  return (
    <div className={styles.content_box}>
      <h2>회원 정보</h2>

      <div className={styles.info_profile_box}>
        <img src={profileImg} alt="프로필 이미지" />
      </div>

      <div className={styles.info_row}>
        <span>아이디</span>
        <strong>{memberId}</strong>
      </div>

      <div className={styles.info_row}>
        <span>닉네임</span>
        <strong>{memberNickname || "등록된 닉네임이 없습니다."}</strong>
      </div>
    </div>
  );
};

// 주문 목록을 카드 형태로 보여주는 컴포넌트이다.
const OrderList = ({ title, orders }) => {
  return (
    <div className={styles.content_box}>
      <h2>{title}</h2>

      {orders.length === 0 ? (
        <div className={styles.empty_box}>표시할 주문이 없습니다.</div>
      ) : (
        <div className={styles.order_list}>
          {orders.map((order) => (
            <div className={styles.order_card} key={order.orderNo}>
              <div className={styles.order_card_top}>
                <strong>{order.breadName || `빵 번호 ${order.breadNo}`}</strong>
                <span>{changeStatusName(order.orderStatus)}</span>
              </div>

              <p>주문 번호 : {order.orderNo}</p>
              <p>주문 수량 : {order.orderCount}개</p>
              <p>총 금액 : {Number(order.totalPrice).toLocaleString()}원</p>
              <p>
                주문 날짜 :{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString()
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// DB에 저장된 주문 상태명을 화면에 보여줄 한글 이름으로 바꾼다.
const changeStatusName = (status) => {
  if (status === "PAID") return "주문 완료";
  if (status === "CANCEL_REQUEST") return "취소 요청";
  if (status === "CANCEL_COMPLETE") return "취소 완료";
  if (status === "REFUND_COMPLETE") return "환불 완료";
  return status;
};

export default MyPage;
