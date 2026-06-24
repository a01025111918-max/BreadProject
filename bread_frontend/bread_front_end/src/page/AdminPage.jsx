import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import styles from "./AdminPage.module.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  // 현재 선택한 관리자 메뉴를 저장한다.
  const [activeMenu, setActiveMenu] = useState("paid");

  // 주문 완료 목록을 저장한다.
  const [paidOrders, setPaidOrders] = useState([]);

  // 주문 취소 목록을 저장한다.
  const [cancelOrders, setCancelOrders] = useState([]);

  // 상품 재고 목록을 저장한다.
  const [stockList, setStockList] = useState([]);

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

    // role을 아직 불러오는 중이면 조금 기다린다.
    if (!role) {
      return;
    }

    // ADMIN 권한이 아니면 메인 페이지로 이동한다.
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

  useEffect(() => {
    if (role !== "ADMIN") return;

    // 관리자 주문 완료 목록을 백엔드에서 가져온다.
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/paid`)
      .then((res) => {
        setPaidOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [role]);

  useEffect(() => {
    if (role !== "ADMIN") return;

    fetchCancelOrders();
    fetchStocks();
  }, [role]);

  // 관리자 주문 취소 목록을 다시 가져오는 함수다.
  const fetchCancelOrders = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/orders/cancel`)
      .then((res) => {
        setCancelOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 관리자 상품 재고 목록을 가져오는 함수다.
  const fetchStocks = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/stocks`)
      .then((res) => {
        setStockList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 관리자가 주문 취소 요청을 전체 승인해주는 로직이다.
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

  // 관리자가 주문 취소 요청을 하나만 승인해주는 로직이다.
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

  // 선택한 관리자 메뉴에 따라 오른쪽 화면을 바꿔준다.
  const renderContent = () => {
    switch (activeMenu) {
      case "paid":
        return (
          <AdminOrderList
            title="주문 완료"
            orders={paidOrders}
            usePagination={true}
          />
        );
      case "cancel":
        return (
          <AdminOrderList
            title="주문 취소"
            orders={cancelOrders}
            onCancelOne={cancelOneComplete}
            onCancelAll={cancelComplete}
            usePagination={true}
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

// 관리자 주문 목록을 카드 형태로 보여준다.
const AdminOrderList = ({
  title,
  orders,
  onCancelOne,
  onCancelAll,
  usePagination,
}) => {
  // 현재 보고 있는 페이지 번호를 저장한다.
  const [page, setPage] = useState(0);

  // 검색창에 입력하는 값을 저장한다.
  const [keyword, setKeyword] = useState("");

  // 실제 검색에 사용할 값을 저장한다.
  const [searchKeyword, setSearchKeyword] = useState("");

  // 한 페이지에 보여줄 카드 개수다.
  const size = 3;

  // 아이디나 빵 이름에 검색어가 포함되어 있는 주문만 골라낸다.
  const filteredOrders = orders.filter((order) => {
    const memberId = order.memberId || "";
    const breadName = order.breadName || "";
    const searchText = searchKeyword.trim().toLowerCase();

    return (
      matchSearchText(memberId, searchText) ||
      matchSearchText(breadName, searchText)
    );
  });

  const totalPage = Math.ceil(filteredOrders.length / size);
  const start = page * size;
  const end = start + size;

  // 페이지네이션을 사용할 때는 현재 페이지에 해당하는 3개만 보여준다.
  const viewOrders = usePagination
    ? filteredOrders.slice(start, end)
    : filteredOrders;

  useEffect(() => {
    // 검색 결과나 목록이 바뀌면 다시 첫 페이지부터 보여준다.
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

      {usePagination && (
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
              // 글자를 입력하는 중에도 바로 검색 결과가 바뀌게 한다.
              setSearchKeyword(e.target.value);
            }}
            placeholder="회원 아이디 또는 빵명 검색"
          />
          <button type="submit">검색</button>
        </form>
      )}

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

      {usePagination && totalPage > 1 && (
        <AdminPagination page={page} setPage={setPage} totalPage={totalPage} />
      )}
    </div>
  );
};

// 관리자 상품 재고 목록을 카드 형태로 보여준다.
const AdminStockList = ({ title, stocks }) => {
  // 현재 보고 있는 페이지 번호를 저장한다.
  const [page, setPage] = useState(0);

  // 한 페이지에 보여줄 재고 카드 개수다.
  const size = 3;

  const totalPage = Math.ceil(stocks.length / size);
  const start = page * size;
  const end = start + size;
  const viewStocks = stocks.slice(start, end);

  useEffect(() => {
    // 재고 목록이 바뀌면 다시 첫 페이지부터 보여준다.
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
                  <img src={stock.breadThumb} alt={stock.breadName} />
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
                <p className={styles.stock_count}>현재 재고 : {stock.breadStock}개</p>
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

// 목록 아래에 보여줄 간단한 페이지네이션이다.
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

// 각 주문 상태명을 화면에 보여줄 한글 이름으로 바꿔준다.
const changeStatusName = (status) => {
  if (status === "PAID") return "주문 완료";
  if (status === "CANCEL_REQUEST") return "취소 요청";
  if (status === "CANCEL_COMPLETE") return "취소 완료";
  if (status === "REFUND_COMPLETE") return "환불 완료";
  return status;
};

// 빵 판매 상태명을 화면에 보여줄 한글 이름으로 바꿔준다.
const changeBreadStatusName = (status) => {
  if (status === "SALE") return "판매중";
  if (status === "SOLD_OUT") return "품절";
  if (status === "STOP") return "판매중지";
  return status;
};

// 검색어와 실제 글자를 비교한다.
// 예: "소ㄱ"이라고 입력해도 "소금빵"을 찾을 수 있게 한다.
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
