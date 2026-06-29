import { Route, Routes } from "react-router-dom";

import "./App.css";
import Header from "./commons/Header";
import Footer from "./commons/Footer";
import Main from "./page/Main";
import JoinPage from "./page/JoinPage";
import LoginPage from "./page/LoginPage";
import SubBreadPage from "./page/SubBreadPage";
import SeasonPage from "./page/SeasonPage";
import FindIdPage from "./page/FindIdPage";
import FindPwPage from "./page/FindPwPage";
import ResetPw from "./page/ResetPw";
import AdminPage from "./page/AdminPage";
import BrandPage from "./page/BrandPage";
import MenuPage from "./page/MenuPage";
import EventPage from "./page/EventPage";

import StorePage from "./page/StorePage";
import MyPage from "./page/MyPage";
import { useEffect } from "react";
import useAuthStore from "./authstore/useAuthStore";
import axios from "axios";

function App() {
  //로그인한 유저의 정보를 담는 스토어에서 토큰을 가져오는 로직
  const token = useAuthStore((state) => state.token);
  const { isReady, setReady } = useAuthStore();
  //-> 즉 서버에서 일부 유저 정보를 수정했을 때, 그 정보가 새로고침 될 때마다 반영이 되도록 하는 로직

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      // 1. 토큰이 없으면 준비 완료로 간주 (비로그인 유저)
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/auth/me`,
        );

        useAuthStore.setState({
          memberNo: res.data.memberNo,
          memberId: res.data.memberId,
          memberNickname: res.data.memberNickname,
          role: res.data.role || res.data.memberRole,
          memberThumb: res.data.memberThumb,
          memberStatus: res.data.memberStatus,
        });
      } catch (err) {
        console.error("유저 정보 로드 실패", err);
      } finally {
        // 3. 성공하든 실패하든 데이터 처리가 끝났으므로 ready를 true로
        setReady(true);
      }
    };

    fetchMe();
  }, [token, setReady]);

  //핵심: 데이터가 준비되지 않았을 때는 껍데기만 보여주거나 로딩 처리
  if (!isReady) {
    return <div className="loading">사용자 정보를 불러오는 중이니다..</div>;
  }

  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/season" element={<SeasonPage />} />
        <Route path="/members/join" element={<JoinPage />} />
        <Route path="/members/login" element={<LoginPage />} />
        <Route path="/breads/:breadNo" element={<SubBreadPage />} />
        <Route path="/members/find-id" element={<FindIdPage />} />
        <Route path="/members/find-pw" element={<FindPwPage />} />
        <Route path="/members/reset-pw" element={<ResetPw />} />
        <Route path="/members/admin" element={<AdminPage />} />
        <Route path="/members/mypage" element={<MyPage />} />
        <Route path="/members/store" element={<StorePage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/members/menu" element={<MenuPage />} />
        <Route path="/events" element={<EventPage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
