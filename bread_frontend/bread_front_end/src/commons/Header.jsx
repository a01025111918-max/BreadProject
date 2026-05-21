import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";

const Header = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  return (
    <header className={styles.header_wrap}>
      <div>
        <ul className={styles.header_menu}>
          <li>
            <Link to="#">메뉴1</Link>
          </li>
          <li>
            <Link to="#">메뉴2</Link>
          </li>
          <li>
            <Link to="#">메뉴3</Link>
          </li>
        </ul>
        <div className={styles.header_title}>
          <Link to="/">bread</Link>
        </div>

        <div className={styles.member_link_zone}>
          {token ? (
            // 로그인 상태
            <button
              className="btn primary outline"
              onClick={async () => {
                //-> 로그아웃 버튼을 누르면, 로그아웃 여부를 묻는 모달이 뜨도록 하는 로직
                //-> 여기서 await를 쓰는 이유 비동기 처리이기 때문, 즉, Swal.fire() 함수가 모달이 닫힐 때까지 기다리도록 하는 것
                //-> 다시말해 원래는 로그아웃 버튼을 누르는 동시에 로그인 버튼이 보이는데 그걸 방지하기 위한 로직
                const result = await Swal.fire({
                  title: "로그아웃 하시겠습니까?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmBButtonText: "로그아웃",
                  cancelButtonText: "취소",
                });

                if (result.isConfirmed) {
                  //-> AuthStore의 logout 함수를 호출하여 로그인 관련 상태를 초기화하는 로직
                  //-> 로그아웃 버튼을 누르면, 로그인 관련 상태가 초기화되고, 그 뒤에 토큰이 삭제되는 로직
                  logout(); // 상태 초기화
                  delete axios.defaults.headers.common["Authorization"];
                  navigate("/"); // 홈으로 이동 (선택)
                }
              }}
            >
              로그아웃
            </button>
          ) : (
            //  비로그인 상태
            <>
              <button
                className="btn primary"
                onClick={() => navigate("/members/login")}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
