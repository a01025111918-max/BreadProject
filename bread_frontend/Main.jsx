//main.module.css를 해주지 않으면 왜 에러가 날까?
import styles from "./Main.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const navigate = useNavigate();
  const [breadList, setBreadList] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/breads`)
      .then((res) => {
        console.log(res.data);
        setBreadList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    //처음 Main 컴포넌트 열릴 때 딱 1번 실행
  }, []);
  return (
    <div className={styles.total_main_wrap}>
      <div className={styles.main_wrap}>
        <h1 className={styles.page_title}>메인</h1>
      </div>
      <div className={styles.main_card_wrap}>
        {/*서버에서 받아온 빵 리스트를 map으로 돌려서 카드 형태로 보여주기*/}
        {breadList.map((bread) => (
          <div
            className={styles.main_card}
            key={bread.breadNo}
            //-> 카드 클릭 시, 해당 빵의 상세 페이지로 이동하는 로직
            onClick={() => navigate(`/breads/${bread.breadNo}`)}
          >
            <img
              className={styles.bread_img}
              src={`${import.meta.env.VITE_BACKSERVER}/${bread.breadThumb}`}
              alt={bread.breadName}
            ></img>
            <h3>{bread.breadName}</h3>
            <p>{bread.breadContent}</p>
            <span>{bread.breadPrice}원</span>
            <div>{bread.breadCategory}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Main;
