import axios from "axios";
import styles from "./ResetPw.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ResetPw = () => {
  const navigate = useNavigate();
  //1. 부모객체인 memeber에서 memberId, memberEmail을 상태를 이용하여 찾기를 위한 상태
  const [member, setMember] = useState({ memberId: "", memberPw: "" });

  //2. 비밀번호 일치 여부 확인 위한 상태
  const [checkPw, setCheckPw] = useState(0);
  //3. 비밀번호 다시 입력하는란 만들기
  const [memberPwRe, setMemberPwRe] = useState("");
  //4. 비밀번호 유효성 검사 상태
  const [pwMessage, setPwMessage] = useState("");

  //11. 비밀번호 재설정 요청 함수
  const requestResetPw = (e) => {
    e.preventDefault();

    if (checkPw != 1) {
      Swal.fire({
        title: "비밀번호 일치 여부 확인 필요",
        text: "비밀번호 일치 여부를 확인해주세요",
        icon: "warning",
      });
      return;
    }

    //12. 비밀번호 규칙 준수 여부 확인
    if (pwMessage !== "안전한 비밀번호입니다") {
      Swal.fire({
        title: "비밀번호 규칙 준수 여부 확인 필요",
        text: "비밀번호 규칙 준수 여부를 확인해주세요",
        icon: "warning",
      });
      return;
    }

    //13. 비밀번호 재설정 로직을 보내기 위한 로직 짜기
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/reset-pw`, member)
      .then((res) => {
        console.log(res.data);
        if (res.data === "SUCCESS") {
          alert("비밀번호 재설정 완료");
        }

        navigate("/members/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //14. 새로운 비밀번호 입력하기 위한 로직
  const handleNewPwChange = (e) => {
    const { name, value } = e.target;
    // 한글 즉시 제거
    const cleanedValue = value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "");

    //복합 조건 검사 로직
    const englishCount = (cleanedValue.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (cleanedValue.match(/[0-9]/g) || []).length;
    const specialCount = (cleanedValue.match(/[!@#$%^&*()_+~`-]/g) || [])
      .length;

    if (englishCount < 3 || numberCount < 4 || specialCount < 1) {
      setPwMessage(
        "비밀번호는 영문 3개 이상, 숫자 4개 이상, 특수문자 1개 이상 포함 하셔야 합니다.",
      );
    } else if (cleanedValue.length >= 8) {
      setPwMessage("안전한 비밀번호입니다.");
    } else {
      setPwMessage("");
    }

    //상태 업데이트
    setMember({ ...member, [name]: cleanedValue });
    // 0: 아직 비교할 대상이 없음, 1: 일치, 2: 일치하지 않음
    /*

    if (!memberPwRe) {
  setCheckPw(0);
} else if (e.target.value === memberPwRe) {
  setCheckPw(1);
} else {
  setCheckPw(2);
}
    
    */
    setCheckPw(!memberPwRe ? 0 : e.target.value === memberPwRe ? 1 : 2);
  };

  //15. 다시 비밀번호 입력하기 위한 로직
  const handleRePwChange = (e) => {
    setMemberPwRe(e.target.value); // 재입력값 상태 업데이트
    setCheckPw(
      !member.memberPw ? 0 : e.target.value === member.memberPw ? 1 : 2,
    );
  };

  return (
    <div className={styles.total_reset_pw_container}>
      <div className={styles.btn_group}>
        <div
          className={styles.home_btn}
          onClick={() => {
            navigate("/");
          }}
        >
          홈으로 가기
        </div>
      </div>

      <div className={styles.reset_pw_wrap}>
        <h1 className="page-title">비밀번호 변경 페이지</h1>
        {/*5. 아이디 입력란 만들기  */}
        <form>
          <div className={styles.input_wrap}>
            <label htmlFor="memberId" className={styles.label_id}>
              아이디
            </label>
            <input
              type="text"
              name="memberId"
              value={member.memberId}
              className={styles.input_id}
              onChange={(e) =>
                setMember({ ...member, memberId: e.target.value })
              }
              placeholder="아이디 입력"
            />
          </div>

          {/*6. 새로운 비밀번호 입력란 만들기 */}
          <div className={styles.input_wrap}>
            <label htmlFor="memberPw">새비밀번호</label>
            <input
              type="password"
              name="memberPw"
              value={member.memberPw}
              className={styles.input_pw}
              onChange={handleNewPwChange}
              placeholder="새비밀번호 입력"
            ></input>
            {/*7. 비밀번호 강도 메세지 출력  */}
            <p
              style={{
                color: pwMessage === "안전한 비밀번호입니다." ? "green" : "red",
                fontSize: "0.8rem",
                marginTop: "5px",
              }}
            >
              {pwMessage}
            </p>
          </div>
          {/*8. 비밀번호 다시 입력란 만들기 */}
          <div className={styles.input_wrap}>
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={memberPwRe}
              className={styles.input_repw}
              onChange={handleRePwChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {/*9. 비밀번호 일치 여부 메세지 */}
          {checkPw === 1 && (
            <span style={{ color: "green" }}>비밀번호가 일치합니다</span>
          )}
          {checkPw === 2 && (
            <span style={{ color: "red" }}>비밀번호가 일치하지 않습니다</span>
          )}

          {/*10. 비밀번호 변경 버튼 */}
          <button
            type="submit"
            className={styles.reset_pw_btn}
            onClick={requestResetPw}
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPw;
