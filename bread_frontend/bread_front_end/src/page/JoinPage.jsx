import styles from "./JoinPage.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import EmailAuth from "../emailauth/EmailAuth";

//(1) 회원가입 페이지 컴포넌트
const JoinPage = () => {
  const navigate = useNavigate();

  //(7) 이메일 인증이 완료되었는지를 관리하는 상태 -> 그전에 emailAuth 컴포넌트를 만들고 오기
  const [emailVerified, setEmailVerified] = useState(false);
  //(2) 회원가입에 필요한 정보들을 관리하는 상태
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberNickname: "",
    memberAddress: "",
    memberPhone: "",
    memberEmail: "",
  });

  //(22) 비밀번호 다시 입력하는란 만들기
  const [memberPwRe, setMemberPwRe] = useState("");

  //(11) 아이디 중복 체크 상태
  const [checkId, setCheckId] = useState(0);

  //(24) 비밀번호 일치 여부 상태를 확인하는 상태
  const [checkPw, setCheckPw] = useState(0);

  //(19)  아이디 중복 체크 메시지
  const [idMessage, setIdMessage] = useState("");
  //(32) 비밀번호 유효성 검사 상태
  const [pwMessage, setPwMessage] = useState("");
  //(27) 아이디 정규식 로직 짜기
  const validateId = (id) => {
    //영문 숫자만 1-8자, 영문 최소 2개 이상, 숫자 최소 2개이상 영문 + 숫자 조합이어야만 함
    //-> 길이도 4자 이상 8자 이하
    if (id.length === 0) {
      return "";
    }

    if (id.length < 4) {
      return "4자 이상 입력해야 합니다.";
    }
    if (id.length > 8) {
      return "아이디의 길이는 8자 이하만 가능합니다. ";
    }

    if (!/^[a-zA-Z0-9]*$/.test(id)) {
      return "아이디는 영문 and 숫자만 사용가능해요.";
    }

    //먼저 변수 선언
    const englishCount = (id.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (id.match(/[0-9]/g) || []).length;

    if (englishCount < 2 || numberCount < 2) {
      return "아이디는 영문 2개 이상, 숫자 2개 이상 포함해야 합니다.";
    }

    return "";
  };

  //(33) 비밀번호 정규식 로직 짜기
  const validatePw = (pw) => {
    //영문 3개 이상, 숫자 4개 이상, 특수문자 1개 이상 포함 로직짜기
    const englishCount = (pw.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (pw.match(/[0-9]/g) || []).length;
    const specialCount = (pw.match(/[!@#$%^&*()_+~`-]/g) || []).length;
    if (pw.length === 0) return "";
    if (englishCount < 3 || numberCount < 4 || specialCount < 1) {
      return "비밀번호는 영문 3개 이상, 숫자 4개 이상, 특수문자 1개 이상 포함 하셔야 합니다.";
    }
    return "";
  };

  //(13) 아이디 중복 체크 함수
  //(18) 이디 입력칸이 비어 있는 상태에서 blur되면 이상한 에러가 날 수 있음
  //-> trim을 쓰는 이유 -> trim을 쓰지 않으면 실수로 스페이스바를 여러번 눌러
  //-> 공백이 발생하고 그렇게 되면 이상한 에러가 날 수 있음
  //-> 따라서 trim을 사용하여 공백을 제거
  //-> 아이디에서 앞뒤 공백을 제거했는데도 빈 문자열이면
  //즉, 사용자가 아무 아이디도 안 쓴 거면
  //중복체크하지 말고 멈추라는 의미가 있음
  const ipDupCheck = () => {
    const memberId = member.memberId.trim();

    // 아이디 입력 안 했으면 중복체크 안 함
    //-> 따라서 아이디를 입력하지 않고 다음칸으로 넘어갈 때 중복체크하라는 메세지가 안뜸
    if (memberId === "") {
      setCheckId(0);
      setIdMessage("아이디를 입력하세요.");
      return;
    }

    // 아이디 중복 체크
    //-> 이미 중복체크 로직이 있음에도 여기에서 한번더 하는 이유
    //-> 금은 아이디가 규칙에 안 맞아도 blur 되면 서버에 중복 체크 요청을 보낼 수 있음
    //-> 따라서 짜줘야 함
    const errorMessage = validateId(memberId);
    if (errorMessage !== "") {
      setCheckId(0);
      setIdMessage(errorMessage);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/check-Id`, {
        params: {
          memberId: memberId,
        },
      })
      .then((res) => {
        console.log(res.data);

        // res.data === true  -> 이미 존재하는 아이디
        // res.data === false -> 사용 가능한 아이디
        if (res.data === false) {
          setCheckId(1);
          //(20) 사용 가능한 아이디 메시지
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

  //(26) 비밀번호 일치 여부를 확인하는 함수
  //-> 하나의 함수를 만들어서 설정을 해도 되는데
  //-> 굳이 useFffect를 쓰는 이유는?
  //-> 비밀번호 확인은 사실상 상태값 2개를 감시해서 결과를 만드는 작업이라서 useEffect가 더 자연스럽다
  //-> 왜? 상태가 바뀌면 React가 자동으로 실행하기 떄문이다.
  //-> 그에 반해 함수 설정은 사용자가 입력했을 떄에만 작동한다.
  useEffect(() => {
    if (!memberPwRe) {
      setCheckPw(0);
      return;
    }
    setCheckPw(member.memberPw === memberPwRe ? 1 : 2);
  }, [memberPwRe, member.memberPw]);
  //-> 일단 여기까지 아이디는 영문과 숫자만 가능하게 설정하는건 내일부터

  //(4) 회원가입 페이지에서 입력된 정보를 업데이트하는 함수
  const inputMember = (e) => {
    const { name, value } = e.target;

    //(28) 아이디 정규식 로직 짜기
    if (name === "memberId") {
      const cleanedValue = value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "");

      //아이디가 바뀌면 기존 중복 체크 결과는 초기화
      setCheckId(0);

      if (cleanedValue.length === 0) {
        setIdMessage("");
        setMember({ ...member, [name]: "" });
        return;
      }

      //(29) 특수문자 입력 방지 로직
      if (!/^[a-zA-Z0-9]*$/.test(cleanedValue)) {
        setIdMessage("아이디는 영문과 숫자만 사용가능입니다.");
        return;
      }

      //(30) 아이디 길이글자수 제한
      if (cleanedValue.length > 8) {
        setIdMessage("아이디의 길이는 8자 이하만 가능합니다.");
        return;
      }

      const errorMessage = validateId(cleanedValue);
      setIdMessage(errorMessage);

      //(31) 모든 조건 통과 시 메세지 초기화

      setMember({ ...member, [name]: cleanedValue });
      return;
    }

    //(34) 비밀번호 정규식 로직 짜기 (영문3↑, 숫자4↑, 특수문자1↑, 8자↑, 한글불가)
    if (name === "memberPw") {
      const cleanedValue = value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "");
      const errorMessage = validatePw(cleanedValue);
      setPwMessage(errorMessage);

      //복합 조건 검사 로직을 위한 변수 선언
      const englishCount = (cleanedValue.match(/[a-zA-Z]/g) || []).length;
      const numberCount = (cleanedValue.match(/[0-9]/g) || []).length;
      const specialCount = (cleanedValue.match(/[!@#$%^&*]/g) || []).length;

      //비밀번호 설정 영어 , 숫자, 특수문자 제한
      if (
        cleanedValue.length > 0 &&
        (englishCount < 3 ||
          numberCount < 4 ||
          specialCount < 1 ||
          cleanedValue.length < 8)
      ) {
        setPwMessage(
          "영문(3개↑), 숫자(4개↑), 특수문자(1개↑) 조합 8자 이상 필요",
        );
      } else if (cleanedValue.length >= 8) {
        setPwMessage("안전한 비밀번호입니다.");
      } else {
        setPwMessage("");
      }

      setMember({ ...member, [name]: cleanedValue });
      return;
    }

    //(16) 아이디 중복 체크 상태 초기화
    //-> 여기엣 상태 초기화를 안해주면 예전 값이 그대로 남아 있음.
    if (name === "memberId") {
      setCheckId(false);
      //(21) 아이디 중복 체크 메시지 초기화
      setIdMessage("");
    }

    //(9) 이메일 입력시 이메일 인증 상태 초기화
    if (name === "memberEmail") {
      setEmailVerified(false);
    }

    setMember({
      ...member,
      [name]: value,
    });
    console.log(name, value);
  };

  //(5) 회원가입을 처리하는 함수
  const joinMember = (e) => {
    e.preventDefault();

    //(14) 아이디 입력 누락
    if (member.memberId === "") {
      alert("아이디를 입력해주세요");
      return;
    }

    //(15) 아이디 중복 체크
    if (!checkId) {
      alert("아이디 중복 체크 필요");
      return;
    }

    //(35) 아이디 유효성 검사 알람 뜨게 하기
    // "사용 가능한 아이디입니다."가 아닐 때(즉, 에러 메시지가 들어있을 때)만 알림창이 뜨도록 수정
    if (
      idMessage &&
      idMessage !== "" &&
      idMessage !== "사용 가능한 아이디입니다."
    ) {
      Swal.fire({
        title: "아이디 확인",
        text: "아이디가 제대로 입력되지 않았습니다.",
        icon: "warning",
      });
      return;
    }

    //(36) 비밀번호 조합이 맞는지 알림창으로 뜨게 하기
    // "안전한 비밀번호입니다."가 아닐 때(즉, 에러 메시지가 들어있을 때)만 알림창이 뜨도록 예외 처리 추가 가능
    if (pwMessage !== "" && pwMessage !== "안전한 비밀번호입니다.") {
      Swal.fire({
        title: "비밀번호 확인",
        text: "비밀번호가 제대로 입력되지 않았습니다.",
        icon: "warning",
      });
      return;
    }

    //(37) 비밀번호 일치 여부 체크
    if (checkPw !== 1) {
      Swal.fire({
        title: "비밀번호 확인",
        text: "비밀번호가 일치하지 않습니다",
        icon: "warning",
      });
      return;
    }

    //(10) 이메일 인증이 완료되지 않은 경우 회원가입을 진행하지 않고 경고창을 띄우는 로직
    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증이 필요합니다",
        text: "이메일 인증을 완료해주세요",
        icon: "warning",
      });
      return;
    }

    //(6) 회원가입 요청을 서버에 보내는 로직
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members`, member)
      .then((res) => {
        console.log(res.data);
        alert("회원가입 완료");
        //회원가입이 완료되고 나면 초기화 한다는 내용
        setMember({
          memberId: "",
          memberPw: "",
          memberName: "",
          memberNickname: "",
          memberAddress: "",
          memberPhone: "",
          memberEmail: "",
        });
        navigate("/members/login");
      })
      .catch((err) => {
        console.log(err);
        alert("회원가입실패");
      });
  };

  return (
    //(3) 회원가입 페이지의 UI를 구성하는 JSX 코드
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
            /*(12) 아이디 중복 체크 */
            /*
              onBlur: 입력란에서 내용을 적고 입력란에서 벗어낫을 때 
              다음 함수를 실행하고 신호을 전달
            */
            onBlur={ipDupCheck}
            /*(29) 아이디 정규식에 대한 메세지를 입력란에 표시 */
            placeholder="영문, 숫자 조합 8자 이내"
          ></input>
          {/*(22) 아이디 중복 체크 */}
          {idMessage !== "" && (
            <p className={checkId === 1 ? styles.success : styles.fail}>
              {idMessage}
            </p>
          )}
          <div className={styles.input_wrap}>
            <label htmlFor="memberPw">비밀번호</label>
            <input
              type="password"
              name="memberPw"
              id="memberPw"
              value={member.memberPw}
              onChange={inputMember}
              className={styles.input_field}
              placeholder="영문3, 숫자4, 특수문자하나 이상"
            ></input>
            {/*(38) 비밀번호 정규식에 대한 메세지를 입력란에 표시 */}
            {pwMessage && (
              <p
                className={
                  pwMessage.includes("안전")
                    ? styles.check_msg
                    : `${styles.check_msg} ${styles.invalid}`
                }
              >
                {pwMessage}
              </p>
            )}

            {/*(23) 비밀번호 재입력*/}
            <label htmlFor="memberPwRe">비밀번호재입력</label>
            <input
              type="password"
              name="memberPwRe"
              id="memberPwRe"
              value={memberPwRe}
              onChange={(e) =>
                setMemberPwRe(
                  // 비밀번호에서는 한글을 제거
                  e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, ""),
                )
              }
              className={styles.input_field}
            />
            {/*(25) 비밀번호 재입력 이어서 하기 */}
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
          </div>

          <label htmlFor="memberName">이름</label>
          <input
            type="text"
            name="memberName"
            id="memberName"
            value={member.memberName}
            onChange={inputMember}
          ></input>

          <label htmlFor="memberNickname">닉네임</label>
          <input
            type="text"
            name="memberNickname"
            id="memberNickname"
            value={member.memberNickname}
            onChange={inputMember}
          ></input>

          <label htmlFor="memberAddress">주소</label>
          <input
            type="text"
            name="memberAddress"
            id="memberAddress"
            value={member.memberAddress}
            onChange={inputMember}
          ></input>

          <label htmlFor="memberPhone">전화번호</label>
          <input
            type="text"
            name="memberPhone"
            id="memberPhone"
            value={member.memberPhone}
            onChange={inputMember}
          ></input>

          {/* (8) 이메일 인증 컴포넌트 */}
          <EmailAuth
            memberEmail={member.memberEmail}
            setMemberEmail={(email) =>
              setMember({ ...member, memberEmail: email })
            }
            onVerified={setEmailVerified}
          ></EmailAuth>

          <button className="btn primary" type="submit">
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};
export default JoinPage;
