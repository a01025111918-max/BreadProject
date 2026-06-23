import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import styles from "./AdminPage.module.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  // 관리자 페이지에서 현재 선택한 메뉴를 저장한다.
  const [activeMenu, setActiveMenu] = useState("paid");

  // 주문 완료 목록을 저장한다.
  const [paidOrders, setPaidOrders] = useState([]);

  //주문 취소 목록을 저장하기
  const [cancelOrders, setCancelOrders] = useState([]);

  useEffect(() => {
    // 로그인을 하지 않은 사용자는 관리자 페이지에 들어갈 수 없다.
    if (!token) {
      Swal.fire({
        title: "로그인이 필요합니다",
        text: "로그인 페이지로 이동합니다",
        icon: "warning",
      }).then(() => {
        navigate("/members/login");
      });
      return;
    }

    // 토큰은 있는데 role을 아직 불러오는 중이면 조금 기다린다.
    if (!role) {
      return;
    }

    // role이 ADMIN이 아니면 메인 페이지로 돌려보낸다.
    if (role !== "ADMIN") {
      Swal.fire({
        title: "관리자가 아닙니다",
        text: "관리자만 접속할 수 있습니다",
        icon: "warning",
      }).then(() => {
        navigate("/");
      });
    }
  }, [token, role, navigate]);

  // 관리자 주문 완료 목록을 백엔드에서 가져온다.
  useEffect(() => {
    if (role !== "ADMIN") return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/paid`)
      .then((res) => {
        setPaidOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [role]);

  // 관리자 주문 취소 목록을 백엔드에서 가져온다.
  useEffect(() => {
    if (role !== "ADMIN") return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel`)
      .then((res) => {
        setCancelOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [role]);

  // 관리자가 주문 취소 요청을 승인해주는 로직
  const cancelComplete = () => {
    Swal.fire({
      title: "전체 취소 요청을 승인하시겠습니까?",
      text: "승인하면 주문 상태가 취소 완료로 바뀌고 재고가 복구됩니다.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "승인",
      cancelButtonText: "취소",
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel/complete`)
        .then((res) => {
          Swal.fire({
            title: "취소 승인이 완료되었습니다.",
            text: `${res.data}건 처리되었습니다.`,
            icon: "success",
          });

          return axios.get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel`);
        })
        .then((res) => {
          setCancelOrders(res.data);
        })
        .catch((err) => {
          Swal.fire({
            title: "취소 승인에 실패했습니다.",
            text: err.response?.data || "잠시 후 다시 시도해주세요.",
            icon: "warning",
          });
        });
    });
  };


  // 관리자가 주문 취소 요청을 하나만 승인해주는 로직
  const cancelOneComplete = (order) => {
    if (order.orderStatus !== "CANCEL_REQUEST") {
      Swal.fire({
        title: "이미 처리된 주문입니다.",
        icon: "info",
      });
      return;
    }

    Swal.fire({
      title: "정말 취소승인을 하시겠습니까?",
      text: `${order.memberNickname || order.memberId}님의 ${order.breadName} 주문을 취소 승인합니다.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel/${order.orderNo}/complete`)
        .then(() => {
          Swal.fire({
            title: "취소 승인이 완료되었습니다.",
            icon: "success",
          });

          return axios.get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel`);
        })
        .then((res) => {
          setCancelOrders(res.data);
        })
        .catch((err) => {
          Swal.fire({
            title: "취소 승인에 실패했습니다.",
            text: err.response?.data || "잠시 후 다시 시도해주세요.",
            icon: "warning",
          });
        });
    });
  };
  // 선택한 관리자 메뉴에 따라 오른쪽 내용을 바꾼다.
  const renderContent = () => {
    switch (activeMenu) {
      case "paid":
        return <AdminOrderList title="주문 완료" orders={paidOrders} />;
      case "cancel":
        return (
          <AdminOrderList
            title="주문 취소"
            orders={cancelOrders}
            onCancelOne={cancelOneComplete}
          />
        );
      case "stock":
        return (
          <AdminEmpty
            title="상품 재고"
            text="상품 재고 관리 기능은 다음 단계에서 연결합니다."
          />
        );
      default:
        return null;
    }
  };

  if (!token || !role) {
    return (
      <div className={styles.admin_wrap}>관리자 정보를 확인하는 중입니다.</div>
    );
  }

  if (role !== "ADMIN") {
    return null;
  }

  return (
    <section className={styles.admin_wrap}>
      <aside className={styles.admin_aside}>
        <div className={styles.home_btn}>
          <Link to="/">HOME</Link>
        </div>

        <div className={styles.admin_profile_box}>
          <span>ADMIN</span>
          <h1>관리자 페이지</h1>
          <p>주문과 상품 상태를 확인합니다.</p>
        </div>

        <nav className={styles.admin_menu}>
          <button
            type="button"
            className={activeMenu === "paid" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("paid")}
          >
            주문완료
          </button>

          <div className={styles.cancel_wrap}>
            <button
              type="button"
              className={activeMenu === "cancel" ? styles.active_menu : ""}
              onClick={() => setActiveMenu("cancel")}
            >
              주문취소
            </button>

            <button
              className={styles.cancel_complete_btn}
              onClick={cancelComplete}
            >
              전체 취소승인
            </button>
          </div>

          <button
            type="button"
            className={activeMenu === "stock" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("stock")}
          >
            상품재고
          </button>
        </nav>
      </aside>

      <main className={styles.admin_content}>{renderContent()}</main>
    </section>
  );
};

// 관리자 주문 목록을 카드 형태로 보여준다.
const AdminOrderList = ({ title, orders, onCancelOne }) => {
  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <h2>{title}</h2>
        <span>{orders.length}건</span>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty_box}>표시할 주문이 없습니다.</div>
      ) : (
        <div className={styles.order_list}>
          {orders.map((order) => (
            <div
              className={`${styles.order_card} ${
                onCancelOne && order.orderStatus === "CANCEL_REQUEST"
                  ? styles.clickable_order_card
                  : ""
              }`}
              key={order.orderNo}
              onClick={() => {
                if (onCancelOne) {
                  onCancelOne(order);
                }
              }}
            >
              <div className={styles.order_card_top}>
                <div>
                  <strong>{order.breadName}</strong>
                  <p>{order.memberNickname || order.memberId}</p>
                </div>
                <span>{changeStatusName(order.orderStatus)}</span>
              </div>

              <div className={styles.order_info_grid}>
                <p>주문 번호 : {order.orderNo}</p>
                <p>회원 아이디 : {order.memberId}</p>
                <p>주문 수량 : {order.orderCount}개</p>
                <p>총 금액 : {Number(order.totalPrice).toLocaleString()}원</p>
                <p>
                  주문 날짜 :{" "}
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 각 주문 상태명을 화면에 보여준다.
const changeStatusName = (status) => {
  if (status === "PAID") return "주문 완료";
  if (status === "CANCEL_REQUEST") return "취소 요청";
  if (status === "CANCEL_COMPLETE") return "취소 완료";
  if (status === "REFUND_COMPLETE") return "환불 완료";
  return status;
};

// 아직 연결하지 않은 관리자 메뉴의 기본 화면이다.
const AdminEmpty = ({ title, text }) => {
  return (
    <div className={styles.content_box}>
      <h2>{title}</h2>
      <div className={styles.empty_box}>{text}</div>
    </div>
  );
};

export default AdminPage;
