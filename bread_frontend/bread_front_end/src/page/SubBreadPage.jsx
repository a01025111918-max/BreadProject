import styles from "./SubBreadPage.module.css";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import { useNavigate } from "react-router-dom";

const OrderPopup = ({ isOpen, onClose, breadDetail }) => {
  //-> 구매 수량을 관리하는 상태
  //-> 초기값은 1로 설정, 사용자가 수량을 입력할 때마다 업데이트 되는 로직
  //-> 그래서 생기는 문제점-> 마지막으로 구매한 수량이 그대로 남음
  const [count, setCount] = useState(1);
  const memberNo = useAuthStore((state) => state.memberNo);

  //esc닫기

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

  //주문하기 로직-> 구매 수량과 빵 번호를 근거로 서버에 주문 요청을 보내는 로직
  const handleOrder = async () => {
    if (!memberNo) {
      Swal.fire({
        title: "회원정보가 없습니다.",
        text: "다시 로그인 해주세요.",
        icon: "warning",
      });
      return;
    }
    try {
      //주문 로직이기 떄문에 동기 처리로 작성-> 그래서 await 사용
      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/orders`,
        {
          memberNo: memberNo,
          breadNo: breadDetail.breadNo,
          orderCount: count,
        },
      );

      console.log(res.data);
      return true;
    } catch (err) {
      console.log("상태코드:", err.response?.status);
      console.log("서버응답:", err.response?.data);
      Swal.fire({
        title: "주문에 실패하였습니다.",
        text: "잔액을 확인해 주세요",
        icon: "werning",
      });
      return false;
    }
  };

  return (
    <div className={styles.order_popup_wrap}>
      <div className={styles.order_overlay} onClick={onClose}></div>
      <div
        className={styles.order_container}
        //팝업 안쪽 내부를 클릭했을 때는 창이 닫히지 않게 하는 것
        onClick={(e) => e.stopPropagation()}
      >
        <h2>주문하기</h2>
        <div className={styles.info_box}>
          <p>{breadDetail.breadName}</p>
          <p>{breadDetail.breadPrice}원</p>
        </div>
        <input
          type="number" //숫자를 입력하는 로직 -> 숫자를 위아래로 조절할 수 있는 화살표가 생김
          max={breadDetail.breadStock} //최대 수량은 재고 수량으로 정의-> 이게 없으면 무한대로 올라감
          min="1" //최소 수량 1개로 정의-> 이게 없으면 -까지 내려감
          value={count}
          //수량을 입력할 때마다 count 상태가 업데이트 되는 로직
          //-> 그래서 Number를 사용
          onChange={(e) => setCount(Number(e.target.value))}
          className={styles.count_input}
        ></input>
        <div className={styles.total_price}>
          총 금액:
          <span>{breadDetail.breadPrice * count}원</span>
        </div>
        <button
          className={styles.buy_btn}
          onClick={async () => {
            const result = await Swal.fire({
              title: "정말 구매하시겠습니까?",
              text: `${count}개를 구매합니다.`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "구매",
              cancelButtonText: "취소",
            });

            // 구매 확정
            if (result.isConfirmed) {
              console.log("구매 수량:", count);

              const success = await handleOrder();

              if (!success) return;

              await Swal.fire({
                title: "구매 완료!",
                icon: "success",
              });

              // 수량 초기화
              setCount(1);

              // 팝업 닫기
              onClose();

              // 구매 요청 보내기
            }
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
  // 개별적으로 가져오기
  const token = useAuthStore((state) => state.token);
  const memberNo = useAuthStore((state) => state.memberNo);
  const isReady = useAuthStore((state) => state.isReady);

  console.log("SubBreadPage token =", token);
  console.log("SubBreadPage memberNo =", memberNo);
  //-> URL에 담긴 빵 번호를 가져오는 로직
  //-> 그래서 아직 백엔드에 요청을 보내지 않았음에도 빵번호를 가져올 수 있음.
  const { breadNo } = useParams();
  const [breadDetail, setBreadDetail] = useState({
    breadNo: "",
    breadCategory: "",
  });

  // 빵 상세 정보를 위한 상태값
  const [breadNutrition, setBreadNutrition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    //-> URL에 담긴 빵 번호를 근거로 서버에서 빵 상세 정보를 불러오는 로직
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

  //빵 영양 상세 정보
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads/${breadNo}/nutrition`)
      .then((res) => {
        console.log("빵 영양 상세 정보:", res.data);
        setBreadNutrition(res.data);
      })
      .catch((err) => {
        console.log("빵 영양 상세 정보 조회 실패:", err);
      });
  }, [breadNo]);

  return (
    <div className={styles.sub_bread_page_wrap}>
      <div className={styles.sub_bread_page_card}>
        <div className={styles.img_box}>
          <img
            className={styles.bread_img}
            src={`${import.meta.env.VITE_BACKSERVER}/${breadDetail.breadThumb}`}
            alt={breadDetail.breadName}
          ></img>
        </div>

        <div className={styles.bread_info_box}>
          <p className={styles.bread_category}>{breadDetail.breadCategory}</p>
          <h1>{breadDetail.breadName}</h1>

          <p className={styles.bread_content}>{breadDetail.breadContent}</p>

          <p className={styles.bread_price}>{breadDetail.breadPrice}원</p>

          <p className={styles.bread_stock}>
            재고 : {breadDetail.breadStock}개
          </p>
        </div>
      </div>

      <div className={styles.order_zone}>
        <button
          className="btn primary"
          onClick={() => {
            // 로그인 여부 확인
            //-> 그런데 로그인 직후에 token만 저장되고 memberNo는 /auth/me로 나중에 채워지는 흐름
            //-> 그래서 memberNo가 아직 스토어에 채워지기 전에 주문하기 버튼을 누르는 경우가 생김
            //-> 계속 로그인을 유지하라고 알람이 뜸
            //저장된 로그인 정보 불러오기 완료 여부

            if (!isReady) {
              Swal.fire({
                title: "로그인 정보 불러오는 중",
                text: "잠시만 기다려，请.",
                icon: "warning",
              });
              return;
            }

            if (!token) {
              Swal.fire({
                icon: "warning",
                title: "로그인이 필요합니다",
                text: "로그인 페이지로 이동합니다.",
              }).then(() => {
                navigate("/members/login");
              });
              return;
            }

            if (!memberNo) {
              Swal.fire({
                title: "로그인 정보 불러오는 중",
                text: "잠시만 기다려주세요.",
                icon: "warning",
              });
              return;
            }

            setIsOpen(true);
          }}
        >
          주문하기
        </button>
      </div>
      <OrderPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        breadDetail={breadDetail}
      />

      {/* 빵 상세 정보 */}
      {/*
      section 여러 개 써도 문제 없음
하지만 지금은 div가 더 단순하고 관리하기 쉬움
큰 구역은 section, 작은 디자인 박스는 div
      
      
      */}
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
    </div>
  );
};
export default SubBreadPage;
