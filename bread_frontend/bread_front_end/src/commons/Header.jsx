import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";

const Header = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

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
            <Link to="/">STORE</Link>
          </li>
          <li>
            <Link to="/">ORDER</Link>
          </li>
        </ul>

        <div className={styles.member_link_zone}>
          {token ? (
            <button type="button" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <button type="button" onClick={() => navigate("/members/login")}>
              로그인
            </button>
          )}
        </div>

        <div className={styles.admin_link_zone}>
          <button type="submit" onClick={() => navigate("/members/admin")}>
            관리자
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
