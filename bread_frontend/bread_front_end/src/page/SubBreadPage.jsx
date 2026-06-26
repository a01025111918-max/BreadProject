import styles from "./SubBreadPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";

// 주문하기 버튼을 눌렀을 때 열리는 주문 팝업 컴포넌트
const OrderPopup = ({ isOpen, onClose, breadDetail, onOrderSuccess }) => {
  // B2B 주문 기준값: 최소 주문 수량은 10개이고, 1박스는 10개로 계산한다.
  const MIN_ORDER_COUNT = 10;
  const BOX_COUNT = 10;

  // count에는 실제 주문 개수를 저장한다. 박스 단위를 선택해도 10, 20처럼 개수로 저장된다.
  const [count, setCount] = useState(MIN_ORDER_COUNT);
  const [orderUnit, setOrderUnit] = useState("piece");
  const memberNo = useAuthStore((state) => state.memberNo);

  // 현재 재고가 최소 주문 수량보다 적으면 주문을 막는다.
  const stock = Number(breadDetail.breadStock) || 0;
  const canOrder = stock >= MIN_ORDER_COUNT;

  // 사용자가 입력한 수량을 최소 수량, 현재 재고, 선택한 납품 단위에 맞게 보정한다.
  const getValidCount = (value, unit = orderUnit) => {
    let nextCount = Number(value) || MIN_ORDER_COUNT;
    nextCount = Math.max(nextCount, MIN_ORDER_COUNT);

    if (stock > 0) {
      nextCount = Math.min(nextCount, stock);
    }

    if (unit === "box") {
      nextCount = Math.ceil(nextCount / BOX_COUNT) * BOX_COUNT;

      if (stock > 0 && nextCount > stock) {
        nextCount = Math.floor(stock / BOX_COUNT) * BOX_COUNT;
      }

      nextCount = Math.max(nextCount, MIN_ORDER_COUNT);
    }

    return nextCount;
  };

  // 납품 단위를 바꾸면 기존 수량도 해당 단위 기준에 맞게 다시 계산한다.
  const handleUnitChange = (unit) => {
    setOrderUnit(unit);
    setCount((prev) => getValidCount(prev, unit));
  };

  useEffect(() => {
    if (!isOpen) return;

    // 팝업을 새로 열 때마다 기본값을 개별 주문 10개로 초기화한다.
    setCount(MIN_ORDER_COUNT);
    setOrderUnit("piece");

    //esc를 누를 떄 팝업창이 닫히게 하는 로직
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOrder = () => {
    if (!memberNo) {
      Swal.fire({
        title: "회원 정보가 없습니다.",
        text: "다시 로그인해주세요.",
        icon: "warning",
      });
      return;
    }

    // 재고가 10개 미만이면 B2B 최소 주문 조건을 만족하지 못하므로 주문을 막는다.
    if (!canOrder) {
      Swal.fire({
        title: "주문 가능 수량이 부족합니다.",
        text: "B2B 납품 주문은 최소 10개부터 가능합니다.",
        icon: "warning",
      });
      return;
    }

    // 잘못된 입력이나 프론트 조작으로 최소 수량/재고 범위를 벗어난 경우 한 번 더 막는다.
    if (count < MIN_ORDER_COUNT || count > stock) {
      Swal.fire({
        title: "수량을 확인해주세요.",
        text: `주문 수량은 ${MIN_ORDER_COUNT}개 이상, 현재 재고 이하로 선택해주세요.`,
        icon: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/orders`, {
        memberNo: memberNo,
        breadNo: breadDetail.breadNo,
        orderCount: count,
      })
      .then((res) => {
        console.log(res.data);

        Swal.fire({
          title: "주문이 완료되었습니다.",
          icon: "success",
        }).then(() => {
          // 주문 번호와 수량을 부모 페이지로 넘겨서 상세 페이지에 주문취소 버튼을 보여준다.
          onOrderSuccess({
            orderNo: res.data.orderNo,
            count: count,
          });

          setCount(MIN_ORDER_COUNT);
          onClose();
        });
      })
      .catch((err) => {
        Swal.fire({
          title: "주문에 실패했습니다.",
          text: err.response?.data || "수량 또는 재고를 확인해주세요.",
          icon: "warning",
        });
      });
  };

  return (
    <div className={styles.order_popup_wrap}>
      <div className={styles.order_overlay} onClick={onClose}></div>
      <div
        className={styles.order_container}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>주문하기</h2>
        <div className={styles.info_box}>
          <p>{breadDetail.breadName}</p>
          <p>{breadDetail.breadPrice?.toLocaleString()}원</p>
        </div>

        <div className={styles.order_unit_box}>
          <p>납품 단위</p>
          <div className={styles.unit_buttons}>
            <button
              type="button"
              className={orderUnit === "piece" ? styles.active_unit : ""}
              onClick={() => handleUnitChange("piece")}
            >
              개별
            </button>
            <button
              type="button"
              className={orderUnit === "box" ? styles.active_unit : ""}
              onClick={() => handleUnitChange("box")}
            >
              박스
            </button>
          </div>
          <span>1박스 = 10개</span>
        </div>

        <label className={styles.count_label} htmlFor="orderCount">
          주문 수량
        </label>
        <input
          id="orderCount"
          type="number"
          max={breadDetail.breadStock}
          min={MIN_ORDER_COUNT}
          step={orderUnit === "box" ? BOX_COUNT : 1}
          value={count}
          onChange={(e) => setCount(getValidCount(e.target.value))}
          onBlur={(e) => setCount(getValidCount(e.target.value))}
          className={styles.count_input}
          disabled={!canOrder}
        />
        <p className={styles.min_order_text}>
          최소 구매 단위는 10개부터 입니다.
        </p>

        <div className={styles.total_price}>
          총 금액:
          <span>{(breadDetail.breadPrice * count).toLocaleString()}원</span>
        </div>

        <button
          className={styles.buy_btn}
          disabled={!canOrder}
          onClick={() => {
            Swal.fire({
              title: "정말 주문하시겠습니까?",
              text: `${count}개를 주문합니다.`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "주문",
              cancelButtonText: "취소",
            }).then((result) => {
              if (result.isConfirmed) {
                handleOrder();
              }
            });
          }}
        >
          주문하기
        </button>

        <button className={styles.close_btn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

//부모 컴포넌트
const SubBreadPage = () => {
  const navigate = useNavigate();
  const { breadNo } = useParams();
  const token = useAuthStore((state) => state.token);
  const memberNo = useAuthStore((state) => state.memberNo);
  const isReady = useAuthStore((state) => state.isReady);

  const [breadDetail, setBreadDetail] = useState({
    breadNo: "",
    breadCategory: "",
    breadPrice: 0,
    breadStock: 0,
  });
  const [breadNutrition, setBreadNutrition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [editingReviewNo, setEditingReviewNo] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editContent, setEditContent] = useState("");
  const [deleteReview, setDeleteReview] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  // 현재 빵에 등록된 후기 목록, 평균 별점, 후기 작성 가능 여부를 조회한다.
  const fetchReviews = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setReviewCount(res.data.reviewCount || 0);
        setCanWriteReview(res.data.canWriteReview || false);
      })
      .catch((err) => {
        console.log("리뷰 조회 실패:", err);
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
        setCanWriteReview(false);
      });
  };

  // 주문이 성공하면 주문 번호를 저장하고 상세 페이지에 주문취소 버튼을 보여준다.
  const handleOrderSuccess = (orderInfo) => {
    setCompletedOrder(orderInfo);
    fetchReviews();
  };

  // 주문취소 버튼을 눌렀을 때 취소 요청을 백엔드로 보낸다.
  const handleOrderCancel = () => {
    if (!completedOrder?.orderNo) {
      Swal.fire({
        title: "취소할 주문 정보가 없습니다.",
        icon: "warning",
      });
      return;
    }

    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/orders/${completedOrder.orderNo}/cancel`,
        {
          cancelReason: "사용자 주문 취소 요청",
        },
      )
      .then((res) => {
        console.log(res.data);

        Swal.fire({
          title: "주문 취소 요청이 완료되었습니다.",
          icon: "success",
        }).then(() => {
          setCompletedOrder(null);
          fetchReviews();
        });
      })
      .catch((err) => {
        Swal.fire({
          title: "주문 취소 요청에 실패했습니다.",
          text: err.response?.data || "잠시 후 다시 시도해주세요.",
          icon: "warning",
        });
      });
  };
  // 주문하기 버튼 클릭 전 로그인 상태를 확인한 뒤 주문 팝업을 연다.
  const handleOrderClick = () => {
    if (!isReady) {
      Swal.fire({
        title: "로그인 정보를 불러오는 중입니다.",
        text: "잠시 후 다시 시도해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다.",
        text: "로그인 페이지로 이동합니다.",
      }).then(() => {
        navigate("/members/login");
      });
      return;
    }

    if (!memberNo) {
      Swal.fire({
        title: "회원 정보를 불러오는 중입니다.",
        text: "잠시 후 다시 시도해주세요.",
        icon: "warning",
      });
      return;
    }

    setIsOpen(true);
  };

  // 후기 등록 영역을 열고 닫으며, 로그인/구매 여부를 먼저 확인한다.
  const handleReviewToggle = () => {
    if (showReviews) {
      setShowReviews(false);
      return;
    }

    if (!token) {
      Swal.fire({
        title: "로그인이 필요합니다.",
        text: "후기 등록을 하려면 먼저 로그인해주세요.",
        icon: "warning",
      }).then(() => {
        navigate("/members/login");
      });
      return;
    }

    if (!canWriteReview) {
      Swal.fire({
        title: "먼저 주문하셔야 후기등록을 하실 수 있습니다.",
        icon: "warning",
      });
      return;
    }

    setShowReviews(true);
  };

  // 사용자가 선택한 별점과 후기 내용을 백엔드에 등록한다.
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({
        title: "로그인이 필요합니다.",
        text: "리뷰를 작성하려면 먼저 로그인해주세요.",
        icon: "warning",
      }).then(() => {
        navigate("/members/login");
      });
      return;
    }

    if (!memberNo) {
      Swal.fire({
        title: "회원 정보를 불러오는 중입니다.",
        text: "잠시 후 다시 시도해주세요.",
        icon: "warning",
      });
      return;
    }

    if (selectedRating === 0) {
      Swal.fire({
        title: "별점을 선택해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!reviewContent.trim()) {
      Swal.fire({
        title: "리뷰 내용을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/reviews`, {
        memberNo: memberNo,
        rating: selectedRating,
        reviewContent: reviewContent,
      })
      .then((res) => {
        console.log("리뷰 등록 성공:", res.data);

        Swal.fire({
          title: "리뷰가 등록되었습니다.",
          icon: "success",
        });

        setSelectedRating(0);
        setReviewContent("");
        setShowReviews(false);
        fetchReviews();
      })
      .catch((err) => {
        console.log("리뷰 등록 실패:", err);
        Swal.fire({
          title: "리뷰 등록 실패",
          text: err.response?.data || "잠시 후 다시 시도해주세요.",
          icon: "error",
        });
      });
  };

  // 수정하기 버튼을 누르면 기존 후기 내용을 수정 입력 상태로 바꾼다.
  const handleEditClick = (review) => {
    setEditingReviewNo(review.reviewNo);
    setEditRating(review.rating);
    setEditContent(review.reviewContent);
  };

  // 후기 수정 입력을 취소하고 원래 후기 카드 상태로 되돌린다.
  const handleEditCancel = () => {
    setEditingReviewNo(null);
    setEditRating(0);
    setEditContent("");
  };

  // 수정한 별점과 후기 내용을 기존 후기 위에 덮어쓴다.
  const handleReviewUpdate = (e, reviewNo) => {
    e.preventDefault();

    if (editRating === 0) {
      Swal.fire({
        title: "별점을 선택해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!editContent.trim()) {
      Swal.fire({
        title: "후기 내용을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/reviews/${reviewNo}`,
        {
          memberNo: memberNo,
          rating: editRating,
          reviewContent: editContent,
        },
      )
      .then((res) => {
        console.log("후기 수정 성공:", res.data);

        Swal.fire({
          title: "후기가 수정되었습니다.",
          icon: "success",
        });

        handleEditCancel();
        fetchReviews();
      })
      .catch((err) => {
        console.log("후기 수정 실패:", err);
        Swal.fire({
          title: "후기 수정 실패",
          text: err.response?.data || "잠시 후 다시 시도해주세요.",
          icon: "error",
        });
      });
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}`)
      .then((res) => {
        setBreadDetail(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [breadNo]);

  //빵 영양 상세 정보 로직
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/nutrition`)
      .then((res) => {
        if (typeof res.data === "string") {
          setBreadNutrition(null);
          return;
        }
        setBreadNutrition(res.data);
      })
      .catch((err) => {
        console.log("빵 영양 상세 정보 조회 실패:", err);
        setBreadNutrition(null);
      });
  }, [breadNo]);

  useEffect(() => {
    fetchReviews();
  }, [breadNo]);

  // 후기 삭제 로직
  const handleDeleteReview = (reviewNo) => {
    Swal.fire({
      title: "정말 삭제하시겠습니까?",
      text: "삭제한 후기는 다시 되돌릴 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      confirmButtonColor: "#d83a2e",
      cancelButtonColor: "#777",
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      setDeleteReview(reviewNo);

      axios
        .delete(
          `${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/reviews/${reviewNo}`,
        )
        .then((res) => {
          console.log("후기 삭제 성공:", res.data);

          Swal.fire({
            title: "후기가 삭제되었습니다.",
            icon: "success",
          });

          if (editingReviewNo === reviewNo) {
            handleEditCancel();
          }

          fetchReviews();
        })
        .catch((err) => {
          console.log("후기 삭제 실패:", err);

          Swal.fire({
            title: "후기 삭제 실패",
            text: err.response?.data || "잠시 후 다시 시도해주세요.",
            icon: "error",
          });
        })
        .finally(() => {
          setDeleteReview(null);
        });
    });
  };

  return (
    <div className={styles.sub_bread_page_wrap}>
      <div className={styles.sub_bread_page_card}>
        <div className={styles.img_box}>
          <img
            className={styles.bread_img}
            src={`${import.meta.env.VITE_BACKSERVER}/${breadDetail.breadThumb}`}
            alt={breadDetail.breadName}
          />
        </div>

        <div className={styles.bread_info_box}>
          <p className={styles.bread_category}>{breadDetail.breadCategory}</p>
          <h1>{breadDetail.breadName}</h1>
          <p className={styles.bread_content}>{breadDetail.breadContent}</p>
          <p className={styles.bread_price}>
            {breadDetail.breadPrice?.toLocaleString()}원
          </p>
          <p className={styles.bread_stock}>
            재고 : {breadDetail.breadStock}개
          </p>
        </div>
      </div>

      <div className={styles.order_zone}>
        <button className="btn primary" onClick={handleOrderClick}>
          주문하기
        </button>

        <button
          type="button"
          className={styles.order_cancel_btn}
          onClick={() => {
            // 취소할 주문 정보가 없으면 handleOrderCancel 안에서 안내창을 보여준다.
            if (!completedOrder?.orderNo) {
              handleOrderCancel();
              return;
            }

            Swal.fire({
              title: "정말 주문 취소를 요청하시겠습니까?",
              text: `${completedOrder.count}개를 취소 요청합니다.`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "예",
              cancelButtonText: "아니요",
            }).then((result) => {
              if (result.isConfirmed) {
                handleOrderCancel();
              }
            });
          }}
        >
          주문취소
        </button>

        <button
          type="button"
          className={styles.review_toggle_btn}
          onClick={handleReviewToggle}
        >
          {showReviews ? "후기 등록 닫기" : "후기 등록"}
        </button>
      </div>

      <OrderPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        breadDetail={breadDetail}
        onOrderSuccess={handleOrderSuccess}
      />

      {showReviews && (
        <div className={styles.review_section}>
          <div className={styles.review_header}>
            <h3>후기</h3>
            {reviewCount > 0 && (
              <p>⭐ {Number(averageRating).toFixed(1)} / 5.0</p>
            )}
          </div>

          <form className={styles.review_form} onSubmit={handleReviewSubmit}>
            <label>별점</label>
            <div className={styles.rating_box}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={
                    star <= selectedRating
                      ? styles.active_star
                      : styles.empty_star
                  }
                  onClick={() => setSelectedRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <label htmlFor="reviewContent">후기 내용</label>
            <textarea
              id="reviewContent"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="이 빵은 어떠셨나요?"
            />

            <button type="submit" className={styles.review_submit_btn}>
              후기 등록
            </button>
          </form>
        </div>
      )}

      <div className={styles.bread_detail_info_box}>
        <h2>영양 정보 및 재료 소개</h2>

        {breadNutrition ? (
          <>
            <div className={styles.detail_item_box}>
              <h3>제품 설명</h3>
              <p>{breadNutrition.detailDescription}</p>
            </div>

            <div className={styles.detail_item_box}>
              <h3>영양 정보</h3>
              <div className={styles.nutrition_grid}>
                <p>1회 제공량 : {breadNutrition.servingSize}</p>
                <p>칼로리 : {breadNutrition.caloriesKcal} kcal</p>
                <p>탄수화물 : {breadNutrition.carbohydrateG} g</p>
                <p>당류 : {breadNutrition.sugarG} g</p>
                <p>단백질 : {breadNutrition.proteinG} g</p>
                <p>지방 : {breadNutrition.fatG} g</p>
                <p>나트륨 : {breadNutrition.sodiumMg} mg</p>
              </div>
            </div>

            <div className={styles.detail_item_box}>
              <h3>재료 소개</h3>
              <p>{breadNutrition.ingredients}</p>
            </div>

            <div className={styles.detail_item_box}>
              <h3>알레르기 정보</h3>
              <p>{breadNutrition.allergyInfo}</p>
            </div>
          </>
        ) : (
          <p className={styles.no_detail_text}>등록된 영양 정보가 없습니다.</p>
        )}
      </div>

      <div className={styles.registered_review_section}>
        <div className={styles.registered_review_header}>
          <h2>등록된 후기글</h2>
          {reviewCount > 0 && (
            <p>⭐ {Number(averageRating).toFixed(1)} / 5.0</p>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className={styles.empty_review_box}>
            <p>등록된 후기글이 없습니다.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div className={styles.review_card} key={review.reviewNo}>
              {editingReviewNo === review.reviewNo ? (
                <form
                  className={styles.review_edit_form}
                  onSubmit={(e) => handleReviewUpdate(e, review.reviewNo)}
                >
                  <div className={styles.review_card_header}>
                    <strong>{review.nickname}</strong>
                    <span>수정 중</span>
                  </div>

                  <label>별점</label>
                  <div className={styles.rating_box}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={
                          star <= editRating
                            ? styles.active_star
                            : styles.empty_star
                        }
                        onClick={() => setEditRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label htmlFor={`editContent-${review.reviewNo}`}>
                    후기 내용
                  </label>
                  <textarea
                    id={`editContent-${review.reviewNo}`}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />

                  <div className={styles.review_edit_actions}>
                    <button type="submit">저장</button>
                    <button type="button" onClick={handleEditCancel}>
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.review_card_header}>
                    <strong>{review.nickname}</strong>
                    <span>⭐ {review.rating}</span>
                  </div>
                  <p>{review.reviewContent}</p>
                  <div className={styles.review_card_bottom}>
                    <time>
                      {review.createdDate
                        ? new Date(review.createdDate).toLocaleDateString()
                        : ""}
                    </time>

                    {Number(review.memberNo) === Number(memberNo) && (
                      <div className={styles.review_action_buttons}>
                        <button
                          type="button"
                          className={styles.review_edit_btn}
                          onClick={() => handleEditClick(review)}
                        >
                          수정하기
                        </button>
                        <button
                          type="button"
                          className={styles.review_delete_btn}
                          onClick={() => handleDeleteReview(review.reviewNo)}
                          disabled={deleteReview === review.reviewNo}
                        >
                          {deleteReview === review.reviewNo
                            ? "삭제 중"
                            : "삭제하기"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubBreadPage;
