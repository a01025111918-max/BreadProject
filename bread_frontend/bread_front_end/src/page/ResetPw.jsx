import axios from "axios";
import styles from "./ResetPw.module.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

const ResetPw = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [member, setMember] = useState({ memberId: "", memberPw: "" });
  const [memberPwRe, setMemberPwRe] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [checkPw, setCheckPw] = useState(0);

  useEffect(() => {
    const memberId = searchParams.get("memberId");

    if (memberId) {
      setMember((prev) => ({ ...prev, memberId: memberId }));
    }
  }, [searchParams]);

  // 비밀번호 규칙 검사
  const isValidPassword = (password) => {
    const englishCount = (password.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (password.match(/[0-9]/g) || []).length;
    const specialCount = (password.match(/[!@#$%^&*()_+~`-]/g) || []).length;

    return (
      password.length >= 8 &&
      englishCount >= 3 &&
      numberCount >= 4 &&
      specialCount >= 1
    );
  };

  // 새 비밀번호 입력 로직
  const handleNewPwChange = (e) => {
    const cleanedValue = e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

    if (cleanedValue === "") {
      setPwMessage("");
    } else if (isValidPassword(cleanedValue)) {
      setPwMessage("안전한 비밀번호입니다.");
    } else {
      setPwMessage("영문 3개 이상, 숫자 4개 이상, 특수문자 1개 이상 포함해야 합니다.");
    }

    setMember({ ...member, memberPw: cleanedValue });

    if (!memberPwRe) {
      setCheckPw(0);
    } else if (cleanedValue === memberPwRe) {
      setCheckPw(1);
    } else {
      setCheckPw(2);
    }
  };

  // 비밀번호 확인 입력 로직
  const handleRePwChange = (e) => {
    const cleanedValue = e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

    setMemberPwRe(cleanedValue);

    if (!member.memberPw || !cleanedValue) {
      setCheckPw(0);
    } else if (cleanedValue === member.memberPw) {
      setCheckPw(1);
    } else {
      setCheckPw(2);
    }
  };

  // 비밀번호 변경 요청 로직
  const requestResetPw = (e) => {
    e.preventDefault();

    if (!member.memberId.trim()) {
      Swal.fire({
        title: "아이디 입력 필요",
        text: "비밀번호를 변경할 아이디를 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!isValidPassword(member.memberPw)) {
      Swal.fire({
        title: "비밀번호 규칙 확인 필요",
        text: "비밀번호 규칙 준수 여부를 확인해주세요.",
        icon: "warning",
      });
      return;
    }

    if (checkPw !== 1) {
      Swal.fire({
        title: "비밀번호 확인 필요",
        text: "비밀번호와 비밀번호 확인이 일치해야 합니다.",
        icon: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/reset-pw`, member)
      .then((res) => {
        console.log(res.data);

        Swal.fire({
          title: "비밀번호 변경 완료",
          text: "로그인 페이지로 이동합니다.",
          icon: "success",
        }).then(() => {
          navigate("/members/login");
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "비밀번호 변경 실패",
          text: err.response?.data || "아이디를 다시 확인해주세요.",
          icon: "error",
        });
      });
  };

  return (
    <section className={styles.reset_page}>
      <div className={styles.reset_card}>
        <div className={styles.visual_panel}>
          <span>PASSWORD RESET</span>
          <h1>새 비밀번호 설정</h1>
          <p>
            안전한 비밀번호로 변경한 뒤 다시 로그인해주세요. 영문, 숫자,
            특수문자를 조합하면 더 안전합니다.
          </p>
        </div>

        <div className={styles.reset_content}>
          <div className={styles.top_links}>
            <button type="button" onClick={() => navigate("/")}>
              HOME
            </button>
            <button type="button" onClick={() => navigate("/members/login")}>
              로그인
            </button>
          </div>

          <div className={styles.title_box}>
            <span>MEMBER SECURITY</span>
            <h2>비밀번호 변경</h2>
            <p>아이디와 새 비밀번호를 입력해주세요.</p>
          </div>

          <form onSubmit={requestResetPw}>
            <div className={styles.input_wrap}>
              <label htmlFor="memberId">아이디</label>
              <input
                type="text"
                id="memberId"
                name="memberId"
                value={member.memberId}
                onChange={(e) =>
                  setMember({ ...member, memberId: e.target.value })
                }
                placeholder="아이디를 입력해주세요"
              />
            </div>

            <div className={styles.input_wrap}>
              <label htmlFor="memberPw">새 비밀번호</label>
              <input
                type="password"
                id="memberPw"
                name="memberPw"
                value={member.memberPw}
                onChange={handleNewPwChange}
                placeholder="영문3, 숫자4, 특수문자1 포함"
              />
              {pwMessage && (
                <p
                  className={
                    isValidPassword(member.memberPw)
                      ? styles.success_msg
                      : styles.fail_msg
                  }
                >
                  {pwMessage}
                </p>
              )}
            </div>

            <div className={styles.input_wrap}>
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                value={memberPwRe}
                onChange={handleRePwChange}
                placeholder="비밀번호를 다시 입력해주세요"
              />
              {checkPw === 1 && (
                <p className={styles.success_msg}>비밀번호가 일치합니다.</p>
              )}
              {checkPw === 2 && (
                <p className={styles.fail_msg}>
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            <button type="submit" className={styles.reset_pw_btn}>
              비밀번호 변경
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPw;
