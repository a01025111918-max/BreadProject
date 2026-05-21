import styles from "./EmailAuth.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const EmailAuth = ({
  //(0) 가져올 변수들을 지정
  memberEmail,
  setMemberEmail,
  onVerified,
  readOnlyEmail,
}) => {
  //(1) 이메일 인증 , 인증 코드
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [inputAuthCode, setInputAuthCode] = useState("");
  //(7) 시간, 타이머 설정
  const [time, setTime] = useState(180);
  const [timeExpired, setTimeExpired] = useState(false);

  //(11) 이메일 정규식 패턴 정의(나중에 정의하는 것)
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  //(3) 메일 보내는 로직 짜기
  const sendMail = () => {
    if (mailAuth === 1) {
      Swal.fire({
        title: "이미 인증메일을 보냈습니다",
        text: "3분 이내에 인증번호를 확인해 주세요",
        icon: "info",
      });
      return;
    }

    // (2) 빈 값 체크
    if (!memberEmail) {
      Swal.fire({
        title: "이메일을 입력해주세요",
        text: "인증번호를 받으실 이메일을 입력해주세요",
        icon: "warning",
      });
      return;
    }

    // (12) 이메일 형식 정규식 검증 추가
    if (!emailRegex.test(memberEmail)) {
      Swal.fire({
        title: "올바르지 않은 이메일 형식",
        text: "이메일 주소를 다시 확인해 주세요. (예: user@example.com)",
        icon: "error",
      });
      return; // 형식이 맞지 않으면 여기서 함수를 종료하여 백엔드로 요청을 보내지 않음
    }

    //(13)
    const payLoad = { memberEmail };
    console.log("이메일 인증 요청", payLoad);
    console.log("서버 주소", import.meta.env.VITE_BACKSERVER);

    //(4) 검증 통과 후 서버에 요청 전송
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/email-verification`, {
        memberEmail,
      })
      .then((res) => {
        console.log("이메일 인증 요청 성공", res);
        setMailAuth(1);
        setMailAuthCode(res.data);
        setTime(180);
        setTimeExpired(false);
        Swal.fire({
          title: "인증번호가 전송되었습니다",
          text: "3분 이내에 인증번호를 확인해 주세요",
          icon: "success",
        });
      })
      .catch((err) => {
        confirm.log("이메일 인증 요청 실패", err);
        if (err.response) {
          console.log("서버 데이터", err.response.data);
          console.log("서버 상태코드", err.response.status);
          console.log("서버 헤더", err.response.headers);
        }
        Swal.fire({
          title: "이메일 인증 요청 실패",
          text: "잠시 후 다시 시도해주세요",
          icon: "error",
        });
      });
  };

  //(8) 타이머 설정
  useEffect(() => {
    if (mailAuth === 1 && timeExpired) return;
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMailAuth(0);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mailAuth, timeExpired]);

  //(9) 자세한 시간 설정
  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  //(5) 비교 인증
  const verifyMailCode = () => {
    if (mailAuth === 3) return;
    if (inputAuthCode === mailAuthCode) {
      setMailAuth(3);
      onVerified(true);
    } else {
      setMailAuth(1);
      onVerified(false);
      Swal.fire({
        title: "인증번호가 일치하지 않습니다",
        icon: "error",
      });
    }
  };

  //(6) 이메일을 입력할 때 새로운 값이면 변하게 하고, 아닌 것은 기존값 그대로 유지
  const inputEmail = (e) => {
    setMemberEmail(e.target.value);
  };

  return (
    //(2) 이메일 입력란 및 인증버튼 만들기
    <>
      {" "}
      {/* 전체를 감싸는 Fragment 추가 */}
      <div className={styles.email_input_wrap}>
        <label htmlFor="memberEmail">이메일</label>
        <div className={styles.input_item}>
          <input
            type="email"
            id="memberEmail"
            value={memberEmail}
            onChange={inputEmail}
            readOnly={readOnlyEmail || mailAuth === 1 || mailAuth === 3}
          />
          <button
            type="button"
            className={styles.email_btn}
            onClick={sendMail}
            disabled={mailAuth === 1 || mailAuth === 3}
          >
            {mailAuth === 1
              ? "전송됨"
              : mailAuth === 3
                ? "인증 완료"
                : "인증번호 전송"}
          </button>
        </div>

        <div className={styles.input_wrap}>
          <label htmlFor="inputAuthCode">이메일 확인</label>
          <div className={styles.input_item}>
            <input
              type="text"
              value={inputAuthCode}
              id="inputAuthCode"
              onChange={(e) => setInputAuthCode(e.target.value)}
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
      </div>
      {/* (10) 시간에 따른 상태 메시지 영역 */}
      {mailAuth === 1 && !timeExpired && <p>남은시간:{showTime()}</p>}
      {mailAuth === 3 && <p className={styles.check_msg}>인증되었습니다.</p>}
      {timeExpired && (
        <p className={`${styles.check_msg} ${styles.invalid}`}>
          {" "}
          {/* 클래스명 오타 및 템플릿 리터럴 수정 */}
          인증시간이 만료되었습니다.
        </p>
      )}
    </>
  );
};
export default EmailAuth;
