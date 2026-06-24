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

  // 마이페이지에서 보여줄 내 주문 목록을 저장한다.
  const [orderList, setOrderList] = useState([]);

  const profileImg = memberThumb ? memberThumb : "/images/default_image.png";

  useEffect(() => {
    // 로그인을 하지 않은 사용자는 마이페이지에 들어올 수 없다.
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

  useEffect(() => {
    if (!memberId) return;

    // 로그인한 회원의 주문 목록만 백엔드에서 가져온다.
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/orders/my`)
      .then((res) => {
        setOrderList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [memberId]);

  const paidOrders = orderList.filter((order) => order.orderStatus === "PAID");

  const cancelOrders = orderList.filter(
    (order) =>
      order.orderStatus === "CANCEL_REQUEST" ||
      order.orderStatus === "CANCEL_COMPLETE" ||
      order.orderStatus === "REFUND_COMPLETE",
  );

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
      <aside className={styles.mypage_aside}>
        <div className={styles.profile_box}>
          <div className={styles.profile_img_box}>
            <img src={profileImg} alt="프로필 이미지" />
          </div>
          <strong>{memberNickname || memberId}</strong>
          <p>{memberId}</p>
        </div>

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

      <main className={styles.mypage_content}>{renderContent()}</main>
    </section>
  );
};

// 회원의 기본 정보를 보여주는 컴포넌트다.
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

// 주문 목록을 카드 형태로 보여주는 컴포넌트다.
const OrderList = ({ title, orders }) => {
  const [page, setPage] = useState(0);
  const size = 3;

  const totalPage = Math.ceil(orders.length / size);
  const start = page * size;
  const end = start + size;
  const viewOrders = orders.slice(start, end);

  useEffect(() => {
    setPage(0);
  }, [orders]);

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <h2>{title}</h2>
        <span>{orders.length}건</span>
      </div>

      {viewOrders.length === 0 ? (
        <div className={styles.empty_box}>표시할 주문이 없습니다.</div>
      ) : (
        <div className={styles.order_list}>
          {viewOrders.map((order) => (
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

      {totalPage > 1 && (
        <MyPagePagination page={page} setPage={setPage} totalPage={totalPage} />
      )}
    </div>
  );
};

// 주문 목록 아래에 보여줄 간단한 페이지네이션이다.
const MyPagePagination = ({ page, setPage, totalPage }) => {
  const pageList = [];

  for (let i = 0; i < totalPage; i++) {
    pageList.push(i);
  }

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
      >
        이전
      </button>

      {pageList.map((pageNo) => (
        <button
          type="button"
          key={pageNo}
          className={page === pageNo ? styles.active_page : ""}
          onClick={() => setPage(pageNo)}
        >
          {pageNo + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPage - 1}
        onClick={() => setPage(page + 1)}
      >
        다음
      </button>
    </div>
  );
};

const changeStatusName = (status) => {
  if (status === "PAID") return "주문 완료";
  if (status === "CANCEL_REQUEST") return "취소 요청";
  if (status === "CANCEL_COMPLETE") return "취소 완료";
  if (status === "REFUND_COMPLETE") return "환불 완료";
  return status;
};

export default MyPage;
