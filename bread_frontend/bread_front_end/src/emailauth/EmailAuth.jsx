import styles from "./EmailAuth.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const EmailAuth = ({
  memberEmail,
  setMemberEmail,
  onVerified,
  readOnlyEmail,
}) => {
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [inputAuthCode, setInputAuthCode] = useState("");
  const [time, setTime] = useState(180);
  const [timeExpired, setTimeExpired] = useState(false);
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const sendMail = () => {
    if (mailAuth === 1) {
      Swal.fire({
        title: "이미 인증 메일을 보냈습니다.",
        text: "3분 안에 인증번호를 확인해주세요.",
        icon: "info",
      });
      return;
    }

    if (!memberEmail) {
      Swal.fire({
        title: "이메일을 입력해주세요.",
        text: "인증번호를 받을 이메일 주소가 필요합니다.",
        icon: "warning",
      });
      return;
    }

    if (!emailRegex.test(memberEmail)) {
      Swal.fire({
        title: "올바르지 않은 이메일 형식입니다.",
        text: "예시처럼 입력해주세요. user@example.com",
        icon: "error",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/email-verification`, {
        memberEmail,
      })
      .then((res) => {
        setMailAuth(1);
        setMailAuthCode(String(res.data));
        setInputAuthCode("");
        setTime(180);
        setTimeExpired(false);
        onVerified(false);
        Swal.fire({
          title: "인증번호를 전송했습니다.",
          text: "3분 안에 인증번호를 입력해주세요.",
          icon: "success",
        });
      })
      .catch((err) => {
        console.log("이메일 인증 요청 실패", err);
        Swal.fire({
          title: "이메일 인증 요청 실패",
          text: "잠시 후 다시 시도해주세요.",
          icon: "error",
        });
      });
  };

  useEffect(() => {
    if (mailAuth !== 1 || timeExpired) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMailAuth(0);
          setTimeExpired(true);
          onVerified(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mailAuth, timeExpired, onVerified]);

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const verifyMailCode = () => {
    if (mailAuth === 3) return;

    if (inputAuthCode === mailAuthCode) {
      setMailAuth(3);
      setTimeExpired(false);
      onVerified(true);
      Swal.fire({
        title: "이메일 인증 완료",
        icon: "success",
      });
    } else {
      setMailAuth(1);
      onVerified(false);
      Swal.fire({
        title: "인증번호가 일치하지 않습니다.",
        icon: "error",
      });
    }
  };

  const inputEmail = (e) => {
    setMemberEmail(e.target.value);
    setMailAuth(0);
    setInputAuthCode("");
    setTimeExpired(false);
    onVerified(false);
  };

  return (
    <div className={styles.email_auth}>
      <div className={styles.field_group}>
        <label htmlFor="memberEmail">이메일</label>
        <div className={styles.input_item}>
          <input
            type="email"
            id="memberEmail"
            value={memberEmail}
            onChange={inputEmail}
            readOnly={readOnlyEmail || mailAuth === 1 || mailAuth === 3}
            placeholder="이메일을 입력하세요."
          />
          <button
            type="button"
            className={styles.email_btn}
            onClick={sendMail}
            disabled={mailAuth === 1 || mailAuth === 3}
          >
            {mailAuth === 1
              ? "전송 완료"
              : mailAuth === 3
                ? "인증 완료"
                : "인증번호 전송"}
          </button>
        </div>
      </div>

      <div className={styles.field_group}>
        <label htmlFor="inputAuthCode">인증번호</label>
        <div className={styles.input_item}>
          <input
            type="text"
            value={inputAuthCode}
            id="inputAuthCode"
            onChange={(e) => setInputAuthCode(e.target.value)}
            placeholder="메일로 받은 인증번호"
            disabled={mailAuth !== 1}
          />
          <button
            type="button"
            className={styles.email_btn}
            onClick={verifyMailCode}
            disabled={mailAuth !== 1}
          >
            메일 인증하기
          </button>
        </div>
      </div>

      {mailAuth === 1 && !timeExpired && (
        <p className={styles.timer_msg}>남은 시간: {showTime()}</p>
      )}
      {mailAuth === 3 && (
        <p className={styles.check_msg}>이메일 인증이 완료되었습니다.</p>
      )}
      {timeExpired && (
        <p className={`${styles.check_msg} ${styles.invalid}`}>
          인증 시간이 만료되었습니다. 다시 전송해주세요.
        </p>
      )}
    </div>
  );
};

export default EmailAuth;
