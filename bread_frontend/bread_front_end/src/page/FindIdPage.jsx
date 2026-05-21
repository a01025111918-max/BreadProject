import styles from "./FindIdPage.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EmailAuth from "../emailauth/EmailAuth";
import axios from "axios";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

//이메일 인증을 통해 아이디를 찾는 페이지
const FindIdPage = () => {
  const navigate = useNavigate();

  //2. 이메일 인증 여부
  const [emailVerified, setEmailVerified] = useState(false);
  //3. 이메일 컴포넌트에서 값을 가져오기 위해서 쓰는 상태
  const [member, setMember] = useState({ memberEmail: "" });
  //6.아이디 찾기 요청이 한 번만 수행되도록 제어하는 ref, 중복 요청 방지용
  const isRequstedRef = useRef(false);

  //5. 자동으로 아이디 찾기 요청을 수행하는 함수
  const fetchFindId = () => {
    //then에서 axios.post()를 쓰고 싶면 fetchFindId()는 반드시 axios.post()의 결과를 반환해야 함
    //-> 따라서 콤마가 axios.post로직에 들어가면 안됨. 그렇게 되면 이메일 객체만 반환, 아이디 조회라는 결과는 반환이 안됨
    return axios.post(`${import.meta.env.VITE_BACKSERVER}/members/find-id`, {
      memberEmail: member.memberEmail,
    });
  };

  //7. 이메일 인증이 완료되면  아이디 찾기 로직을 수행하는 useEffect
  useEffect(() => {
    if (!emailVerified) {
      isRequstedRef.current = false;
      return;
    }
  }, [emailVerified]);

  //8. 이메일 인증이 완료된 상태에서 아이디 찾기 로직을 수행
  const handleFindId = () => {
    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증이 필요합니다",
        text: "이메일 인증을 완료해주세요",
        icon: "warning",
      });
      return;
    }
    // fetchFindId에서 설정한 아이디 찾기가 원활히 이루어지면 이메일로 전송되는 로직
    fetchFindId()
      //.then()을 쓰고 싶으면 fetchFindId()는 반드시 axios.post()의 결과를 반환해야 함
      .then((res) => {
        console.log("아이디 찾기 성공", res.data);
        Swal.fire({
          title: "아이디 찾기 성공",
          text: "아이디가 이메일로 전송되었습니다",
          icon: "success",
          confirmButtonText: "로그인 페이지로 이동",
        }).then(() => {
          console.log("로그인 페이지로 이동");
          navigate("/members/login");
        });
      })
      .catch((err) => {
        console.error("아이디 찾기 실패", err);
        Swal.fire({
          title: "아이디 찾기 실패",
          text: "아이디를 찾을 수 없습니다.",
          icon: "error",
        });
      });
  };
  return (
    <div className={styles.login_total_container}>
      <div className={styles.home_btn}>
        <button onClick={() => navigate("/")}>HOME</button>
      </div>

      <div className={styles.login_btn}>
        <button onClick={() => navigate("/members/login")}>로그인</button>
      </div>

      <div className={styles.find_id_wrap}>
        <h1>아이디 찾기 페이지</h1>
      </div>

      {/*4. 이메일 인증*/}
      <div className={styles.email_auth_wrap}>
        <EmailAuth
          memberEmail={member.memberEmail}
          setMemberEmail={(email) =>
            setMember({ ...member, memberEmail: email })
          }
          onVerified={setEmailVerified}
        ></EmailAuth>
      </div>

      {/*9. 아이디 찾기 로직*/}
      <div className={styles.find_id_btn_wrap}>
        <button
          type="button"
          className={`${styles.find_id_btn} ${!emailVerified ? styles.disabled_btn : ""}`}
          onClick={handleFindId}
          disabled={!emailVerified}
        >
          아이디 찾기
        </button>
      </div>
    </div>
  );
};
export default FindIdPage;
