import styles from "./FindIdPage.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import EmailAuth from "../emailauth/EmailAuth";
import axios from "axios";
import Swal from "sweetalert2";

const FindIdPage = () => {
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [member, setMember] = useState({ memberEmail: "" });
  const isRequestedRef = useRef(false);

  const fetchFindId = () => {
    return axios.post(`${import.meta.env.VITE_BACKSERVER}/members/find-id`, {
      memberEmail: member.memberEmail,
    });
  };

  useEffect(() => {
    if (!emailVerified) {
      isRequestedRef.current = false;
    }
  }, [emailVerified]);

  const handleFindId = () => {
    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증이 필요합니다.",
        text: "인증을 완료한 뒤 아이디 찾기를 진행해주세요.",
        icon: "warning",
      });
      return;
    }

    if (isRequestedRef.current) return;
    isRequestedRef.current = true;

    fetchFindId()
      .then((res) => {
        console.log("아이디 찾기 성공", res.data);
        Swal.fire({
          title: "아이디 찾기 성공",
          text: "가입된 아이디를 이메일로 전송했습니다.",
          icon: "success",
          confirmButtonText: "로그인 페이지로 이동",
        }).then(() => {
          navigate("/members/login");
        });
      })
      .catch((err) => {
        console.error("아이디 찾기 실패", err);
        isRequestedRef.current = false;
        Swal.fire({
          title: "아이디 찾기 실패",
          text: "입력한 이메일로 가입된 아이디를 찾을 수 없습니다.",
          icon: "error",
        });
      });
  };

  return (
    <main className={styles.find_page}>
      <section className={styles.find_card}>
        <div className={styles.visual_panel}>
          <span className={styles.visual_badge}>FIND ACCOUNT</span>
          <h1>아이디를 잊으셨나요?</h1>
          <p>가입할 때 사용한 이메일 인증 후 아이디를 받아볼 수 있어요.</p>
        </div>

        <div className={styles.find_content}>
          <div className={styles.top_links}>
            <Link to="/">홈으로 가기</Link>
            <button type="button" onClick={() => navigate("/members/login")}>
              로그인
            </button>
          </div>

          <div className={styles.title_box}>
            <span>MEMBER HELP</span>
            <h2>아이디 찾기</h2>
            <p>이메일 인증을 완료하면 가입된 아이디를 안내해드려요.</p>
          </div>

          <div className={styles.email_auth_wrap}>
            <EmailAuth
              memberEmail={member.memberEmail}
              setMemberEmail={(email) =>
                setMember({ ...member, memberEmail: email })
              }
              onVerified={setEmailVerified}
            />
          </div>

          <button
            type="button"
            className={styles.find_id_btn}
            onClick={handleFindId}
            disabled={!emailVerified}
          >
            아이디 찾기
          </button>
        </div>
      </section>
    </main>
  );
};

export default FindIdPage;
