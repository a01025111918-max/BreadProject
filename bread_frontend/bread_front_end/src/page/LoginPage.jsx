import styles from "./LoginPage.module.css";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import Swal from "sweetalert2";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setReady } = useAuthStore();
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
  });

  const inputLogin = (e) => {
    const { name, value } = e.target;
    setMember({
      ...member,
      [name]: value,
    });
  };

  const loginMember = (e) => {
    e.preventDefault();

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/login`, member)
      .then((res) => {
        useAuthStore.getState().login(res.data);
        setReady(false);
        setMember({
          memberId: "",
          memberPw: "",
        });

        Swal.fire({
          title: "로그인 성공",
          text: "메인 페이지로 이동합니다.",
          icon: "success",
        });

        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "로그인 실패",
          text: "아이디와 비밀번호를 다시 확인해주세요.",
          icon: "error",
        });
      });
  };

  return (
    <main className={styles.login_page}>
      <section className={styles.login_card}>
        <div className={styles.brand_panel}>
          <span className={styles.brand_badge}>BAKERY LOGIN</span>
          <h1>다시 만나서 반가워요!</h1>
          <p>따뜻한 빵과 달콤한 주문을 계속 이어가세요.</p>
        </div>

        <form className={styles.login_form} onSubmit={loginMember}>
          <Link className={styles.home_link} to="/">
            홈으로 가기
          </Link>

          <div className={styles.title_box}>
            <span>MEMBER</span>
            <h2>로그인</h2>
          </div>

          <div className={styles.input_wrap}>
            <label htmlFor="memberId">아이디</label>
            <input
              type="text"
              id="memberId"
              name="memberId"
              value={member.memberId}
              onChange={inputLogin}
              placeholder="아이디를 입력하세요."
            />

            <label htmlFor="memberPw">비밀번호</label>
            <input
              type="password"
              id="memberPw"
              name="memberPw"
              value={member.memberPw}
              onChange={inputLogin}
              placeholder="비밀번호를 입력하세요."
            />
          </div>

          <button
            type="submit"
            className={styles.login_btn}
            disabled={!member.memberId || !member.memberPw}
          >
            로그인
          </button>

          <div className={styles.search_wrap}>
            <Link to="/members/find-id">아이디 찾기</Link>
            <span />
            <Link to="/members/find-pw">비밀번호 찾기</Link>
            <span />
            <Link to="/members/join">회원가입</Link>
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
