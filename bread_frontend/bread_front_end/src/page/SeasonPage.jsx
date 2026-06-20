import styles from "./SeasonPage.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";

const seasonProductNames = ["단팥크림빵"];

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
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCount(1);
    }
  }, [isOpen, breadDetail]);

  if (!isOpen || !breadDetail) return null;

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

const SeasonPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const memberNo = useAuthStore((state) => state.memberNo);
  const isReady = useAuthStore((state) => state.isReady);

  const [seasonBreads, setSeasonBreads] = useState([]);
  const [selectedBread, setSelectedBread] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads`)
      .then((res) => {
        const filteredList = res.data.filter((bread) =>
          seasonProductNames.some((name) => bread.breadName?.includes(name)),
        );

        setSeasonBreads(filteredList);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleBuyClick = (bread) => {
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

    setSelectedBread(bread);
  };

  return (
    <main className={styles.season_page_wrap}>
      <section className={styles.season_hero}>
        <div className={styles.season_hero_text}>
          <span>Season Special</span>
          <h1>지금만 맛볼 수 있는 계절의 빵</h1>
          <p>
            계절마다 가장 잘 어울리는 재료와 향을 담아 만든 시즌 한정
            메뉴입니다. 봄에는 상큼함을, 여름에는 가벼움을, 가을에는 고소함을,
            겨울에는 따뜻함을 담았습니다. 판매 기간이 지나면 더 이상 만나기
            어려운 특별한 빵을 지금 확인해보세요.
          </p>
        </div>
      </section>

      <section className={styles.season_content}>
        <div className={styles.section_title_box}>
          <span>LIMITED MENU</span>
          <h2>시즌 한정 빵</h2>
        </div>

        <div className={styles.season_card_list}>
          {seasonBreads.map((bread) => (
            <div className={styles.season_card} key={bread.breadNo}>
              <div className={styles.season_img_box}>
                <img
                  src={`${import.meta.env.VITE_BACKSERVER}/${bread.breadThumb}`}
                  alt={bread.breadName}
                />
              </div>

              <div className={styles.season_card_info}>
                <span>{bread.breadCategory}</span>
                <h3>{bread.breadName}</h3>
                <p>
                  봄의 달콤함을 가득 담은 시즌 한정 크림빵입니다.
                  부드러운 생크림 사이로 상큼한 단팥 풍미가 퍼져, 가볍지만 오래
                  기억나는 맛을 선사합니다.
                </p>
                <div className={styles.period_box}>판매 기간: 3월 ~ 4월</div>
                <strong>{bread.breadPrice?.toLocaleString()}원</strong>
                <p className={styles.recommend_text}>
                  이번 계절이 지나기 전에 가장 먼저 맛봐야 할 한정 메뉴입니다.
                </p>

                <div className={styles.action_box}>
                  <button
                    type="button"
                    className={styles.detail_btn}
                    onClick={() => navigate(`/breads/${bread.breadNo}`)}
                  >
                    상세보기
                  </button>
                  <button
                    type="button"
                    className={styles.order_btn}
                    onClick={() => handleBuyClick(bread)}
                  >
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <OrderPopup
        isOpen={!!selectedBread}
        onClose={() => setSelectedBread(null)}
        breadDetail={selectedBread}
      />
    </main>
  );
};

export default SeasonPage;
