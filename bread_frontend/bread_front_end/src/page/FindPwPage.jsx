import styles from "./FindPwPage.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EmailAuth from "../emailauth/EmailAuth";
import axios from "axios";
import Swal from "sweetalert2";

const FindPwPage = () => {
  const navigate = useNavigate();

  //1. 아이디를 상태를 이용하여 찾기를 위한 상태
  const [memberId, setMemberId] = useState("");
  //2. 이메일 값을 가져오기 위한 상태
  const [memberEmail, setMemberEmail] = useState("");
  //3. 이메일 인증 여부
  const [emailVerified, setEmailVerified] = useState(false);

  //5. 아이디와 이메일이 입력되었는지 확인하기 위한 로직
  const verifyInput = () => {
    if (!memberId || !memberEmail) {
      alert("아이디와 이메일를 입력해주세요");
      return;
    }

    //6. 이메일 인증 안했으면 차단
    if (!emailVerified) {
      Swal.fire_({
        title: "이메일 인증이 필요합니다",
        text: "이메일 인증을 완료해주세요",
        icon: "warning",
      });
    }

    //7. 아이디와 이메일을 백엔드로 보내기 위한 로직 짜기
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/find-pw`, {
        memberId: memberId,
        memberEmail: memberEmail,
      })
      .then((res) => {
        console.log(res.data);
        Swal.fire({
          title: "이메일 링크로 비밀번호 찾기 로직을 보냈습니다.",
          text: "이메일로 이동해 주세요",
          icon: "success",
        });
        return;
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "비밀번호 찾기 실패",
          text: "다시 입력해 주세요",
          icon: "error",
        });
        return;
      });
  };

  return (
    <div className={styles.find_pw_wrap}>
      <div className={styles.home_btn}>
        <button onClick={() => navigate("/")}>HOME</button>
      </div>
      <div className={styles.login_btn}>
        <button onClick={() => navigate("/members/login")}>로그인</button>
      </div>
      <div className={styles.find_pw_wrap}>
        <h1 className="page-title">비밀번호 찾기 페이지</h1>
      </div>

      {/*4. 아이디와 이메일를 입력받는 컴포넌트 */}
      <div className={styles.input_wrap}>
        <label className={styles.label_id}>아이디</label>
        <input
          className={styles.input_id}
          type="text"
          value={memberId}
          id="memberId"
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="아이디를 입력해주세요"
        ></input>

        <EmailAuth
          memberEmail={memberEmail}
          setMemberEmail={setMemberEmail}
          onVerified={setEmailVerified}
        ></EmailAuth>
      </div>

      {/*8. 비밀번호 찾기 로직을 위한 실행 버튼 만들기 */}
      <button
        type="button"
        className={styles.find_pw_btn}
        onClick={verifyInput}
        disabled={!emailVerified}
      >
        비밀번호 찾기
      </button>
    </div>
  );
};
export default FindPwPage;
