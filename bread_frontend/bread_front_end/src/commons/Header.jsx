import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";

const Header = () => {
  const navigate = useNavigate();

  // 로그인한 회원 정보를 authStore에서 가져온다.
  const { token, logout, memberId, memberNickname, memberThumb, role } =
    useAuthStore();

  const isLogin = Boolean(token);
  const profileImg = memberThumb ? memberThumb : "/images/default_image.png";

  // 프로필 이미지를 누르면 일반 회원은 마이페이지, 관리자는 관리자 페이지로 이동한다.
  const handleProfileClick = () => {
    if (role === "ADMIN") {
      navigate("/members/admin");
      return;
    }

    navigate("/members/mypage");
  };

  // 로그아웃 버튼을 눌렀을 때 확인창을 띄우고 로그아웃 처리한다.
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "로그아웃 하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "로그아웃",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      logout();
      delete axios.defaults.headers.common["Authorization"];
      navigate("/");
    }
  };

  return (
    <header className={styles.header_wrap}>
      <nav className={styles.header_inner}>
        <ul className={styles.header_menu}>
          <li>
            <Link to="/season">SEASON</Link>
          </li>
          <li>
            <Link to="/brand">BRAND</Link>
          </li>
          <li>
            <Link to="/members/menu">MENU</Link>
          </li>
        </ul>

        <div className={styles.header_title}>
          <Link to="/">BREAD</Link>
        </div>

        <ul className={styles.header_menu}>
          <li>
            <Link to="/events">EVENT</Link>
          </li>
          <li>
            <Link to="/members/store">STORE</Link>
          </li>
        </ul>

        <div className={styles.member_link_zone}>
          {isLogin ? (
            <div className={styles.user_area}>
              <button
                type="button"
                className={styles.profile_button}
                onClick={handleProfileClick}
                aria-label="마이페이지로 이동"
              >
                <img
                  src={profileImg}
                  alt="프로필 이미지"
                  className={styles.profile_img}
                />
              </button>

              <span className={styles.member_name}>
                {memberNickname || memberId}
              </span>

              <button
                type="button"
                className={styles.logout_button}
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => navigate("/members/login")}>
              로그인
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
