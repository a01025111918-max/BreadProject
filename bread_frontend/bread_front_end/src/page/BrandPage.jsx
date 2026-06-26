import { useEffect, useState } from "react";
import styles from "./BrandPage.module.css";
import axios from "axios";

const BrandPage = () => {
  // 브랜드 소개 목록을 저장할 state
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 브랜드 페이지는 특정 번호가 아니라 전체 브랜드 소개를 조회한다.
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/brand`)
      .then((res) => {
        setBrandList(res.data);
      })
      .catch((err) => {
        console.log("브랜드 데이터 로딩 실패", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className={styles.loading}>브랜드 정보를 불러오는 중입니다.</p>;
  }

  return (
    <section className={styles.brand_page}>
      <div className={styles.brand_hero}>
        <span>BAKERY BRAND</span>
        <h1>우리 매장을 위한 납품 베이커리</h1>
        <p>
          매장 운영에 어울리는 빵 브랜드를 확인하고, 안정적인 대량 주문으로
          고객에게 더 다양한 선택지를 제공해보세요.
        </p>
      </div>

      <div className={styles.brand_list}>
        {brandList.length === 0 ? (
          <div className={styles.empty_box}>등록된 브랜드 정보가 없습니다.</div>
        ) : (
          brandList.map((brand) => (
            <div className={styles.brand_card} key={brand.brandNo}>
              <div>
                <span className={styles.bread_name}>{brand.breadName}</span>
                <h2>{brand.brandName}</h2>
                <p>{brand.brandContent}</p>
              </div>
              <button type="button">대량 주문 상담</button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BrandPage;
