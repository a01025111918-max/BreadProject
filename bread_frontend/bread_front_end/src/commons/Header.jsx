import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";

// TEXT 방식 --> 새로운 방식 -> 이 안에 변수명과 텍스트를 집어넣고, TEXT.변수명을 적으면 해당 텍스트가 출력된다.
//-> 한데 모아서 관리하기가 쉽다는 장점이 있다.
const TEXT = {
  logoutConfirm: "로그아웃 하시겠습니까?",
  logout: "로그아웃",
  cancel: "취소",
  login: "로그인",
  admin: "관리자",
  profileAlt: "프로필 이미지",
  mypageLabel: "마이페이지로 이동",
  adminPageLabel: "관리자 페이지로 이동",
  loginRequired: "먼저 로그인을 해주십시오.",
  loginMove: "로그인 페이지로 이동합니다.",
};

const Header = () => {
  const navigate = useNavigate();

  // authStore에서 로그인 정보와 프로필 정보를 가져온다.
  const { token, memberId, role, memberNickname, memberThumb, logout } =
    useAuthStore((state) => state);

  // 토큰이 있으면 로그인한 상태로 판단한다.
  const isLogin = Boolean(token);

  // 프로필 이미지가 없으면 public/images/default_image.png를 보여준다.
  const profileImg = memberThumb ? memberThumb : "/images/default_image.png";

  const handleLogout = async () => {
    // result에 알림창이 실행할 내용을 집어넣고, 선택버튼에 따라 결과를 실행하기
    const result = await Swal.fire({
      title: TEXT.logoutConfirm,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: TEXT.logout,
      cancelButtonText: TEXT.cancel,
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
            <Link to="/">BRAND</Link>
          </li>
          <li>
            <Link to="/">MENU</Link>
          </li>
        </ul>

        <div className={styles.header_title}>
          <Link to="/">BREAD</Link>
        </div>

        <ul className={styles.header_menu}>
          <li>
            <Link to="/">EVENT</Link>
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
                onClick={() => {
                  if (role === "ADMIN") {
                    navigate("/members/admin");
                    return;
                  }

                  navigate("/members/mypage");
                }}
                aria-label={
                  role === "ADMIN" ? TEXT.adminPageLabel : TEXT.mypageLabel
                }
              >
                <img
                  src={profileImg}
                  alt={TEXT.profileAlt}
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
                {TEXT.logout}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => navigate("/members/login")}>
              {TEXT.login}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
