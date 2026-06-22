import useAuthStore from "../authstore/useAuthStore";
import styles from "./AdminPage.module.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// 프론트 — /admin 직접 접근 막기

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  //로그인을 안할 경우
  if (token === null) {
    Swal.fire({
      title: "로그인이 필요합니다",
      text: "로그인 페이지로 이동합니다",
      icon: "warning",
    });
    return navigate("/members/login");
  }

  //로그인은 했지만 관리자가 아닐 경우

  if (role !== "ADMIN") {
    Swal.fire({
      title: "관리자가 아닙니다",
      text: "관리자만 접속할 수 있습니다",
      icon: "warning",
    });
    return navigate("/");
  }

  // 관리자일 때만 아래 화면이 보임

  return (
    <div className={styles.admin_wrap}>
      <h1 className="page-title">관리자 페이지</h1>

      <div className={styles.admin_content_wrap}>
        <button>회원관리</button>
        <button>빵 관리</button>
        <button>리뷰 관리</button>
      </div>
    </div>
  );
};
export default AdminPage;
