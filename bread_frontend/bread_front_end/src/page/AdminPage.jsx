import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import styles from "./AdminPage.module.css";

const CARD_SIZE = 3;

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  // 현재 선택한 관리자 메뉴를 저장한다.
  const [activeMenu, setActiveMenu] = useState("paid");

  // 관리자 페이지에서 사용할 목록 데이터들이다.
  const [paidOrders, setPaidOrders] = useState([]);
  const [cancelOrders, setCancelOrders] = useState([]);
  const [stockList, setStockList] = useState([]);

  // 관리자 권한이 있는지 확인한다.
  useEffect(() => {
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

    if (!role) {
      return;
    }

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

  // 관리자라면 처음 화면에 필요한 데이터를 가져온다.
  useEffect(() => {
    if (role !== "ADMIN") return;

    fetchPaidOrders();
    fetchCancelOrders();
    fetchStocks();
  }, [role]);

  // 주문 완료 목록 조회
  function fetchPaidOrders() {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/paid`)
      .then((res) => {
        setPaidOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // 주문 취소 목록 조회
  function fetchCancelOrders() {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel`)
      .then((res) => {
        setCancelOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // 상품 재고 목록 조회
  function fetchStocks() {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/stocks`)
      .then((res) => {
        setStockList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // 전체 취소 요청 승인
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

          fetchCancelOrders();
          fetchStocks();
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

  // 주문 하나만 취소 승인
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
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel/${order.orderNo}/complete`,
        )
        .then(() => {
          Swal.fire({
            title: "취소 승인이 완료되었습니다.",
            icon: "success",
          });

          fetchCancelOrders();
          fetchStocks();
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

  // 현재 선택한 메뉴에 따라 오른쪽 화면을 바꿔준다.
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
            onCancelAll={cancelComplete}
          />
        );
      case "stock":
        return <AdminStockList title="상품 재고" stocks={stockList} />;
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

          <button
            type="button"
            className={activeMenu === "cancel" ? styles.active_menu : ""}
            onClick={() => setActiveMenu("cancel")}
          >
            주문취소
          </button>

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

// 주문 완료와 주문 취소 목록을 보여준다.
const AdminOrderList = ({ title, orders, onCancelOne, onCancelAll }) => {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredOrders = orders.filter((order) => {
    const memberId = order.memberId || "";
    const breadName = order.breadName || "";
    const searchText = searchKeyword.trim().toLowerCase();

    return (
      matchSearchText(memberId, searchText) ||
      matchSearchText(breadName, searchText)
    );
  });

  const totalPage = Math.ceil(filteredOrders.length / CARD_SIZE);
  const start = page * CARD_SIZE;
  const end = start + CARD_SIZE;
  const viewOrders = filteredOrders.slice(start, end);

  useEffect(() => {
    setPage(0);
  }, [orders, searchKeyword]);

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <h2>{title}</h2>

        <div className={styles.header_right}>
          {onCancelAll && (
            <button
              type="button"
              className={styles.cancel_complete_btn}
              onClick={onCancelAll}
            >
              전체 취소승인
            </button>
          )}
          <span>{filteredOrders.length}건</span>
        </div>
      </div>

      <form
        className={styles.admin_search_form}
        onSubmit={(e) => {
          e.preventDefault();
          setSearchKeyword(keyword);
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setSearchKeyword(e.target.value);
          }}
          placeholder="회원 아이디 또는 빵명 검색"
        />
        <button type="submit">검색</button>
      </form>

      {viewOrders.length === 0 ? (
        <div className={styles.empty_box}>표시할 주문이 없습니다.</div>
      ) : (
        <div className={styles.order_list}>
          {viewOrders.map((order) => (
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

      {totalPage > 1 && (
        <AdminPagination page={page} setPage={setPage} totalPage={totalPage} />
      )}
    </div>
  );
};

// 상품 재고 목록을 보여준다.
const AdminStockList = ({ title, stocks }) => {
  const [page, setPage] = useState(0);

  const totalPage = Math.ceil(stocks.length / CARD_SIZE);
  const start = page * CARD_SIZE;
  const end = start + CARD_SIZE;
  const viewStocks = stocks.slice(start, end);

  useEffect(() => {
    setPage(0);
  }, [stocks]);

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <h2>{title}</h2>
        <span>{stocks.length}건</span>
      </div>

      {viewStocks.length === 0 ? (
        <div className={styles.empty_box}>표시할 상품 재고가 없습니다.</div>
      ) : (
        <div className={styles.stock_list}>
          {viewStocks.map((stock) => (
            <div className={styles.stock_card} key={stock.breadNo}>
              <div className={styles.stock_img_box}>
                {stock.breadThumb ? (
                  <img
                    src={`${import.meta.env.VITE_BACKSERVER}/${stock.breadThumb}`}
                    alt={stock.breadName}
                  />
                ) : (
                  <span>NO IMAGE</span>
                )}
              </div>

              <div className={styles.stock_info}>
                <div className={styles.stock_card_top}>
                  <strong>{stock.breadName}</strong>
                  <span>{changeBreadStatusName(stock.breadStatus)}</span>
                </div>

                <p>빵 번호 : {stock.breadNo}</p>
                <p>분류 : {stock.breadCategory || "미분류"}</p>
                <p>가격 : {Number(stock.breadPrice).toLocaleString()}원</p>
                <p className={styles.stock_count}>
                  현재 재고 : {stock.breadStock}개
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPage > 1 && (
        <AdminPagination page={page} setPage={setPage} totalPage={totalPage} />
      )}
    </div>
  );
};

// 페이지 번호 버튼을 보여준다.
const AdminPagination = ({ page, setPage, totalPage }) => {
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

// 주문 상태값을 한글로 바꿔준다.
const changeStatusName = (status) => {
  if (status === "PAID") return "주문 완료";
  if (status === "CANCEL_REQUEST") return "취소 요청";
  if (status === "CANCEL_COMPLETE") return "취소 완료";
  if (status === "REFUND_COMPLETE") return "환불 완료";
  return status;
};

// 빵 판매 상태값을 한글로 바꿔준다.
const changeBreadStatusName = (status) => {
  if (status === "SALE") return "판매중";
  if (status === "SOLD_OUT") return "품절";
  if (status === "STOP") return "판매중지";
  return status;
};

// 검색어와 실제 글자를 비교한다.
const matchSearchText = (targetText, searchText) => {
  if (searchText === "") return true;

  const target = targetText.toLowerCase();

  if (target.includes(searchText)) {
    return true;
  }

  let targetIndex = 0;

  for (let i = 0; i < searchText.length; i++) {
    const searchChar = searchText[i];
    let isMatched = false;

    while (targetIndex < target.length) {
      const targetChar = target[targetIndex];
      const targetInitial = getHangulInitial(targetChar);

      if (searchChar === targetChar || searchChar === targetInitial) {
        isMatched = true;
        targetIndex++;
        break;
      }

      targetIndex++;
    }

    if (!isMatched) {
      return false;
    }
  }

  return true;
};

// 한글 한 글자의 초성을 구한다.
const getHangulInitial = (char) => {
  const initials = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  const code = char.charCodeAt(0) - 44032;

  if (code < 0 || code > 11171) {
    return char;
  }

  return initials[Math.floor(code / 588)];
};

export default AdminPage;
