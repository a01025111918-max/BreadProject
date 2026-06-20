import styles from "./Main.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const bannerList = [
  {
    id: 1,
    theme: "redbean",
    eyebrow: "SUMMER SALE",
    title: "여름 특가 세일!!",
    description: "단팥 크림빵을 어서 사가세요!!",
    image: "/banner/redbean-cream.png",
    label: "단팥 크림빵",
  },
  {
    id: 2,
    theme: "strawberry",
    eyebrow: "FRESH CAKE",
    title: "상큼한 딸기가 한가득!!",
    description: "어서 와서 맛보세요!",
    image: "/banner/strawberry-cake.png",
    label: "딸기 케이크",
  },
  {
    id: 3,
    theme: "custard",
    eyebrow: "SWEET CREAM",
    title: "입에 한가득!",
    description: "달콤한 슈크림과 함께!!",
    image: "/banner/custard-cream.png",
    label: "슈크림 빵",
  },
];

const Main = () => {
  const navigate = useNavigate();
  const [breadList, setBreadList] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentBreadIndex, setCurrentBreadIndex] = useState(0);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads`)
      .then((res) => {
        setBreadList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerList.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const banner = bannerList[currentBanner];

  // 이전 화살표를 누르면 현재 카드 번호를 하나 줄이고, 첫 카드에서는 마지막 카드로 이동
  const handlePrevBread = () => {
    setCurrentBreadIndex((prev) =>
      prev === 0 ? breadList.length - 1 : prev - 1,
    );
  };

  // 다음 화살표를 누르면 현재 카드 번호를 하나 늘리고, 마지막 카드에서는 첫 카드로 이동
  const handleNextBread = () => {
    setCurrentBreadIndex((prev) =>
      prev === breadList.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <main className={styles.total_main_wrap}>
      <section className={`${styles.hero_banner} ${styles[banner.theme]}`}>
        <div className={styles.banner_text_box}>
          <span className={styles.banner_eyebrow}>{banner.eyebrow}</span>
          <h1>{banner.title}</h1>
          <p>{banner.description}</p>
          <button
            type="button"
            className={styles.banner_button}
            onClick={() => {
              if (banner.theme === "redbean") {
                navigate("/season");
                return;
              }

              const targetBread = breadList.find((breadItem) =>
                breadItem.breadName
                  ?.replaceAll(" ", "")
                  .includes(banner.label.replaceAll(" ", "")),
              );

              if (targetBread) {
                navigate(`/breads/${targetBread.breadNo}`);
              }
            }}
          >
            자세히 보기
          </button>
        </div>

        <div className={styles.banner_image_box}>
          <img src={banner.image} alt={banner.label} />
        </div>

        <div className={styles.banner_dots} aria-label="배너 선택">
          {bannerList.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === currentBanner ? styles.active_dot : ""}
              onClick={() => setCurrentBanner(index)}
              aria-label={`${item.label} 배너 보기`}
            />
          ))}
        </div>
      </section>

      <section className={styles.product_section}>
        <div className={styles.section_title_box}>
          <span>BAKERY MENU</span>
          <h2>TODAY'S BREAD</h2>
          <p>오늘 준비된 달콤하고 따뜻한 빵을 만나보세요.</p>
        </div>

        <div className={styles.bread_slider_wrap}>
          <button
            type="button"
            className={styles.slider_arrow}
            onClick={handlePrevBread}
            disabled={breadList.length === 0}
            aria-label="이전 빵 보기"
          >
            &lt;
          </button>

          <div className={styles.slider_view}>
            <div
              className={styles.main_card_wrap}
              style={{
                // currentBreadIndex 값만큼 카드 묶음을 왼쪽으로 이동
                transform: `translateX(-${currentBreadIndex * 100}%)`,
              }}
            >
              {breadList.map((bread) => (
                <article
                  className={styles.main_card}
                  key={bread.breadNo}
                  onClick={() => navigate(`/breads/${bread.breadNo}`)}
                >
                  <div className={styles.card_img_box}>
                    <img
                      className={styles.bread_img}
                      src={`${import.meta.env.VITE_BACKSERVER}/${bread.breadThumb}`}
                      alt={bread.breadName}
                    />
                  </div>
                  <div className={styles.card_content}>
                    <span className={styles.card_category}>
                      {bread.breadCategory}
                    </span>
                    <h3>{bread.breadName}</h3>
                    <p>{bread.breadContent}</p>
                    <strong>{bread.breadPrice?.toLocaleString()}원</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.slider_arrow}
            onClick={handleNextBread}
            disabled={breadList.length === 0}
            aria-label="다음 빵 보기"
          >
            &gt;
          </button>
        </div>
      </section>
    </main>
  );
};

export default Main;
