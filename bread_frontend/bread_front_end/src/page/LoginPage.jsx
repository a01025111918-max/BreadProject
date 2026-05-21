import styles from "./LoginPage.module.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  //(6)
  const { setReady } = useAuthStore();
  // (1) 사용자의 아이디와 비밀번호를 상태에 따라 값을 변화시키는 것을 표현하는 것
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
  });

  //(4) 값을 입력하면 새로운 값으로 등록되게 하고 그외애는 기존 값을 유지하게 만드는 로직
  const inputLogin = (e) => {
    const { name, value } = e.target;
    setMember({
      ...member,
      [name]: value,
    });
    console.log(name, value);
  };

  //(5) 입력란을 통해 입력된 값을 백엔드로 보내 데이터베이스에 저장하고 요청한 내용을 다시 응답받게하는 구조
  const loginMember = (e) => {
    e.preventDefault();

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/login`, member)
      .then((res) => {
        console.log(res.data);
        //(7) 상태저장 로직, zustend에 저장되어 그 상태를 유지하게 하기 위한 로직
        useAuthStore.getState().login(res.data);
        // 1. 로그인 성공 시, 즉시 ready 상태를 false로 만듭니다.
        // 이 신호가 App.jsx로 전달되어 "로딩 중" 화면을 띄우게 됩니다.
        //(8)
        setReady(false);
        console.log("저장 직후 zustand =", useAuthStore.getState());
        //로그인이 완료되고 나면 초기화 한다는 내용
        setMember({
          memberId: "",
          memberPw: "",
        });
        Swal.fire({
          title: "로그인 성공",
          text: "메인 페이지로 이동합니다",
          icon: "success",
        });
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        alert("로그인 실패");
      });
  };
  return (
    <div className={styles.login_wrap}>
      {/*홈으로 가기 버튼 설정 로직 */}
      <div className={styles.home_btn}>
        <Link to="/">홈으로 가기</Link>
      </div>
      <h1 className={styles.page_title}> 로그인</h1>
      {/*(2) 폼태그, 로그인 형식틀을 만들고 그 안에 아이디와 비밀번호 입력란 만들기  */}
      <form onSubmit={loginMember}>
        <div className={styles.input_wrap}>
          <label htmlFor="memberId">아이디</label>
          <input
            type="text"
            id="memberId"
            name="memberId"
            value={member.memberId}
            onChange={inputLogin}
            placeholder="아이디를 입력하세요."
          ></input>

          <label htmlFor="memberPw">비밀번호</label>
          <input
            type="password"
            id="memberPw"
            name="memberPw"
            value={member.memberPw}
            onChange={inputLogin}
            placeholder="비밀번호를 입력하세요"
            onKeyDown={(e) => {
              if (e.key === false) loginMember();
            }}
          ></input>
        </div>
        {/*(3) 여기에 아이디/비밀번호 찾기 링크 추가 */}
        <div className={styles.search_wrap}>
          <Link to="/members/find-id">아이디 찾기</Link>
          {" || "}
          <Link to="/members/find-pw">비밀번호 찾기</Link>
          {" || "}

          <Link to="/members/join">회원가입</Link>
        </div>

        <button
          type="submit"
          className={styles.login_btn}
          //아이디나 비밀번호가 없으면 로그인 버튼을 누를 수 없게 설정
          disabled={!member.memberId || !member.memberPw}
        >
          로그인
        </button>
      </form>
    </div>
  );
};
export default LoginPage;
