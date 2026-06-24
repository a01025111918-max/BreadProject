import styles from "./FindPwPage.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EmailAuth from "../emailauth/EmailAuth";
import axios from "axios";
import Swal from "sweetalert2";

const FindPwPage = () => {
  const navigate = useNavigate();

  // 비밀번호를 찾을 회원 아이디
  const [memberId, setMemberId] = useState("");

  // 인증에 사용할 이메일
  const [memberEmail, setMemberEmail] = useState("");

  // 이메일 인증 완료 여부
  const [emailVerified, setEmailVerified] = useState(false);

  // 아이디와 이메일 인증 상태를 확인한 뒤 비밀번호 재설정 메일을 요청한다.
  const verifyInput = () => {
    if (!memberId.trim() || !memberEmail.trim()) {
      Swal.fire({
        title: "입력 정보를 확인해주세요",
        text: "아이디와 이메일을 모두 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증이 필요합니다",
        text: "이메일 인증을 완료해주세요.",
        icon: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/find-pw`, {
        memberId: memberId,
        memberEmail: memberEmail,
      })
      .then((res) => {
        console.log(res.data);
        Swal.fire({
          title: "비밀번호 재설정 메일을 보냈습니다",
          text: "이메일에서 재설정 링크를 확인해주세요.",
          icon: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "비밀번호 찾기 실패",
          text: "아이디와 이메일을 다시 확인해주세요.",
          icon: "error",
        });
      });
  };

  return (
    <section className={styles.find_pw_page}>
      <div className={styles.find_pw_card}>
        <div className={styles.visual_panel}>
          <span className={styles.visual_badge}>PASSWORD HELP</span>
          <h1>비밀번호 찾기</h1>
          <p>
            가입한 아이디와 이메일 인증을 확인한 뒤 비밀번호 재설정
            메일을 보내드립니다.
          </p>
        </div>

        <div className={styles.find_pw_content}>
          <div className={styles.top_links}>
            <button type="button" onClick={() => navigate("/")}>
              HOME
            </button>
            <button type="button" onClick={() => navigate("/members/login")}>
              로그인
            </button>
          </div>

          <div className={styles.title_box}>
            <span>MEMBER ACCOUNT</span>
            <h2>비밀번호 찾기</h2>
            <p>아이디 입력 후 이메일 인증을 완료해주세요.</p>
          </div>

          <div className={styles.input_wrap}>
            <label htmlFor="memberId">아이디</label>
            <input
              type="text"
              value={memberId}
              id="memberId"
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="아이디를 입력해주세요"
            />
          </div>

          <div className={styles.email_auth_wrap}>
            <EmailAuth
              memberEmail={memberEmail}
              setMemberEmail={setMemberEmail}
              onVerified={setEmailVerified}
            />
          </div>

          <button
            type="button"
            className={styles.find_pw_btn}
            onClick={verifyInput}
            disabled={!emailVerified}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </section>
  );
};

export default FindPwPage;
