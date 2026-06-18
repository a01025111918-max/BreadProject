import styles from "./SubBreadPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";

const OrderPopup = ({ isOpen, onClose, breadDetail }) => {
  const [count, setCount] = useState(1);
  const memberNo = useAuthStore((state) => state.memberNo);

  useEffect(() => {
    if (!isOpen) return;

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

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/orders`, {
        memberNo: memberNo,
        breadNo: breadDetail.breadNo,
        orderCount: count,
      })
      .then((res) => {
        console.log(res.data);
        Swal.fire({
          title: "구매 완료!",
          icon: "success",
        });
        setCount(1);
        onClose();
      })
      .catch((err) => {
        console.log("상태코드:", err.response?.status);
        console.log("서버응답:", err.response?.data);
        Swal.fire({
          title: "주문에 실패했습니다.",
          text: err.response?.data || "잔액 또는 재고를 확인해주세요.",
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

        <input
          type="number"
          max={breadDetail.breadStock}
          min="1"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className={styles.count_input}
        />

        <div className={styles.total_price}>
          총 금액:
          <span>{(breadDetail.breadPrice * count).toLocaleString()}원</span>
        </div>

        <button
          className={styles.buy_btn}
          onClick={() => {
            Swal.fire({
              title: "정말 구매하시겠습니까?",
              text: `${count}개를 구매합니다.`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "구매",
              cancelButtonText: "취소",
            }).then((result) => {
              if (result.isConfirmed) {
                handleOrder();
              }
            });
          }}
        >
          구매하기
        </button>

        <button className={styles.close_btn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

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

  const fetchReviews = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setReviewCount(res.data.reviewCount || 0);
      })
      .catch((err) => {
        console.log("리뷰 조회 실패:", err);
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
      });
  };

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
        setShowReviews(true);
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

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}`)
      .then((res) => {
        console.log(res.data);
        setBreadDetail(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [breadNo]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/nutrition`)
      .then((res) => {
        console.log("빵 영양 상세 정보:", res.data);
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
          className={styles.review_toggle_btn}
          onClick={() => setShowReviews(!showReviews)}
        >
          {reviewCount === 0
            ? "후기 없음"
            : showReviews
              ? "후기 접기"
              : `후기 ${reviewCount}개 보기`}
        </button>
      </div>

      {/*후기등록 버튼을 누르면 열리는 일종의 팝업창 */}
      <OrderPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        breadDetail={breadDetail}
      />
      {/*그 팝업창에 담겨 있는 내용 */}
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

      {/*위에서 등록한 후기글이 여기 아래에서 화면에서 표현 */}
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
              <div className={styles.review_card_header}>
                <strong>{review.nickname}</strong>
                <span>⭐ {review.rating}</span>
              </div>
              <p>{review.reviewContent}</p>
              <time>
                {review.createdDate
                  ? new Date(review.createdDate).toLocaleDateString()
                  : ""}
              </time>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubBreadPage;
