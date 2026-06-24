import styles from "./JoinPage.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import EmailAuth from "../emailauth/EmailAuth";

const JoinPage = () => {
  const navigate = useNavigate();

  // 회원가입 입력값을 저장하는 state
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberNickname: "",
    memberAddress: "",
    memberPhone: "",
    memberEmail: "",
  });

  // 비밀번호 재입력값
  const [memberPwRe, setMemberPwRe] = useState("");

  // 아이디 중복 체크 상태: 0은 미확인, 1은 사용 가능
  const [checkId, setCheckId] = useState(0);

  // 비밀번호 일치 상태: 0은 미확인, 1은 일치, 2는 불일치
  const [checkPw, setCheckPw] = useState(0);

  const [idMessage, setIdMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  // 아이디 규칙 검사
  const validateId = (id) => {
    if (id.length === 0) return "";
    if (id.length < 4) return "아이디는 4자 이상 입력해야 합니다.";
    if (id.length > 8) return "아이디는 8자 이하만 가능합니다.";
    if (!/^[a-zA-Z0-9]*$/.test(id)) {
      return "아이디는 영문과 숫자만 사용할 수 있습니다.";
    }

    const englishCount = (id.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (id.match(/[0-9]/g) || []).length;

    if (englishCount < 2 || numberCount < 2) {
      return "아이디는 영문 2개 이상, 숫자 2개 이상 포함해야 합니다.";
    }

    return "";
  };

  // 비밀번호 규칙 검사
  const validatePw = (pw) => {
    if (pw.length === 0) return "";

    const englishCount = (pw.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (pw.match(/[0-9]/g) || []).length;
    const specialCount = (pw.match(/[!@#$%^&*()_+~`-]/g) || []).length;

    if (
      pw.length < 8 ||
      englishCount < 3 ||
      numberCount < 4 ||
      specialCount < 1
    ) {
      return "영문 3개 이상, 숫자 4개 이상, 특수문자 1개 이상 포함해야 합니다.";
    }

    return "";
  };

  // 아이디 입력칸에서 벗어났을 때 중복 체크
  const idDupCheck = () => {
    //아이디 공백 제거
    const memberId = member.memberId.trim();

    if (memberId === "") {
      setCheckId(0);
      setIdMessage("아이디를 입력해주세요.");
      return;
    }

    const errorMessage = validateId(memberId);
    if (errorMessage !== "") {
      setCheckId(0);
      setIdMessage(errorMessage);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/check-id`, {
        params: {
          memberId: memberId,
        },
      })
      .then((res) => {
        // true면 이미 있는 아이디, false면 사용 가능한 아이디
        if (res.data === false) {
          setCheckId(1);
          setIdMessage("사용 가능한 아이디입니다.");
        } else {
          setCheckId(0);
          setIdMessage("이미 사용 중인 아이디입니다.");
        }
      })
      .catch((err) => {
        console.log(err);
        setCheckId(0);
        setIdMessage("아이디 중복 체크에 실패했습니다.");
      });
  };

  // 비밀번호와 비밀번호 재입력이 같은지 확인
  useEffect(() => {
    if (!memberPwRe) {
      setCheckPw(0);
      return;
    }

    if (member.memberPw === memberPwRe) {
      setCheckPw(1);
    } else {
      setCheckPw(2);
    }
  }, [member.memberPw, memberPwRe]);

  // input 값 변경 처리
  const inputMember = (e) => {
    const { name, value } = e.target;

    if (name === "memberId") {
      const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, "");

      setCheckId(0);
      setIdMessage(validateId(cleanedValue));
      setMember({ ...member, memberId: cleanedValue });
      return;
    }

    if (name === "memberPw") {
      const cleanedValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

      setPwMessage(validatePw(cleanedValue));
      setMember({ ...member, memberPw: cleanedValue });
      return;
    }

    if (name === "memberEmail") {
      setEmailVerified(false);
    }

    setMember({
      ...member,
      [name]: value,
    });
  };

  // 회원가입 버튼을 눌렀을 때 실행되는 함수
  const joinMember = (e) => {
    e.preventDefault();

    if (member.memberId.trim() === "") {
      Swal.fire({
        title: "아이디 입력 필요",
        text: "아이디를 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    if (checkId !== 1) {
      Swal.fire({
        title: "아이디 중복 체크",
        text: "아이디 입력칸에서 벗어나 중복 체크를 완료해주세요.",
        icon: "warning",
      });
      return;
    }

    if (validatePw(member.memberPw) !== "") {
      Swal.fire({
        title: "비밀번호 확인",
        text: "비밀번호 조건을 다시 확인해주세요.",
        icon: "warning",
      });
      return;
    }

    if (checkPw !== 1) {
      Swal.fire({
        title: "비밀번호 확인",
        text: "비밀번호가 일치하지 않습니다.",
        icon: "warning",
      });
      return;
    }

    if (member.memberName.trim() === "") {
      Swal.fire({
        title: "이름 입력 필요",
        text: "이름을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    if (member.memberNickname.trim() === "") {
      Swal.fire({
        title: "닉네임 입력 필요",
        text: "닉네임을 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증 필요",
        text: "이메일 인증을 완료해주세요.",
        icon: "warning",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members`, member)
      .then((res) => {
        console.log(res.data);

        Swal.fire({
          title: "회원가입 완료",
          text: "로그인 페이지로 이동합니다.",
          icon: "success",
        }).then(() => {
          setMember({
            memberId: "",
            memberPw: "",
            memberName: "",
            memberNickname: "",
            memberAddress: "",
            memberPhone: "",
            memberEmail: "",
          });
          setMemberPwRe("");
          setCheckId(0);
          setCheckPw(0);
          setIdMessage("");
          setPwMessage("");
          setEmailVerified(false);
          navigate("/members/login");
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "회원가입 실패",
          text: err.response?.data || "잠시 후 다시 시도해주세요.",
          icon: "error",
        });
      });
  };

  return (
    <div className={styles.join_wrap}>
      <div className={styles.home_btn}>
        <Link to="/">홈으로</Link>
      </div>

      <h1 className={styles.page_title}>회원가입</h1>

      <form onSubmit={joinMember}>
        <div className={styles.input_wrap}>
          <label htmlFor="memberId">아이디</label>
          <input
            type="text"
            name="memberId"
            id="memberId"
            value={member.memberId}
            onChange={inputMember}
            onBlur={idDupCheck}
            placeholder="영문, 숫자 조합 8자 이내"
          />
          {idMessage !== "" && (
            <p className={checkId === 1 ? styles.success : styles.fail}>
              {idMessage}
            </p>
          )}

          <label htmlFor="memberPw">비밀번호</label>
          <input
            type="password"
            name="memberPw"
            id="memberPw"
            value={member.memberPw}
            onChange={inputMember}
            className={styles.input_field}
            placeholder="영문3, 숫자4, 특수문자 하나 이상"
          />
          {pwMessage !== "" && (
            <p className={`${styles.check_msg} ${styles.invalid}`}>
              {pwMessage}
            </p>
          )}

          <label htmlFor="memberPwRe">비밀번호 재입력</label>
          <input
            type="password"
            name="memberPwRe"
            id="memberPwRe"
            value={memberPwRe}
            onChange={(e) =>
              setMemberPwRe(e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, ""))
            }
            className={styles.input_field}
          />
          {checkPw > 0 && (
            <p
              className={
                checkPw === 1
                  ? styles.check_msg
                  : `${styles.check_msg} ${styles.invalid}`
              }
            >
              {checkPw === 1
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </p>
          )}

          <label htmlFor="memberName">이름</label>
          <input
            type="text"
            name="memberName"
            id="memberName"
            value={member.memberName}
            onChange={inputMember}
          />

          <label htmlFor="memberNickname">닉네임</label>
          <input
            type="text"
            name="memberNickname"
            id="memberNickname"
            value={member.memberNickname}
            onChange={inputMember}
          />

          <label htmlFor="memberAddress">주소</label>
          <input
            type="text"
            name="memberAddress"
            id="memberAddress"
            value={member.memberAddress}
            onChange={inputMember}
          />

          <label htmlFor="memberPhone">전화번호</label>
          <input
            type="text"
            name="memberPhone"
            id="memberPhone"
            value={member.memberPhone}
            onChange={inputMember}
          />

          <EmailAuth
            memberEmail={member.memberEmail}
            setMemberEmail={(email) => {
              setMember({ ...member, memberEmail: email });
              setEmailVerified(false);
            }}
            onVerified={setEmailVerified}
          />

          <button className="btn primary" type="submit">
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinPage;
