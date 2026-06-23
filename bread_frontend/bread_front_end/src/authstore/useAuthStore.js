import axios from "axios";
import Swal from "sweetalert2";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

let alertTimer = null;
let logoutTimer = null;

const FIVE_MINUTES = 5 * 60 * 1000;

const useAuthStore = create(
  persist(
    (set, get) => ({
      memberNo: null,
      memberId: null,
      memberNickname: null,
      role: null,
      memberThumb: null,
      memberStatus: null,
      token: null,
      endTime: null,
      isReady: false,

      stopLoginTimer: () => {
        if (alertTimer) {
          clearTimeout(alertTimer);
          alertTimer = null;
        }

        if (logoutTimer) {
          clearTimeout(logoutTimer);
          logoutTimer = null;
        }
      },

      login: ({
        memberNo,
        memberId,
        memberNickname,
        role,
        memberRole,
        memberThumb,
        memberStatus,
        token,
        endTime,
      }) => {
        // 백엔드에서 memberRole로 내려와도 프론트에서는 role 이름으로 저장한다.
        const loginRole = role || memberRole;

        set({
          memberNo,
          memberId,
          memberNickname,
          role: loginRole,
          memberThumb,
          memberStatus,
          token,
          endTime,
        });

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        get().startLoginTimer(endTime);
      },

      updateToken: (newToken, newEndTime) => {
        get().stopLoginTimer();

        set({
          token: newToken,
          endTime: newEndTime,
        });

        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        get().startLoginTimer(newEndTime);
      },

      confirmLogout: async () => {
        const result = await Swal.fire({
          title: "로그아웃 하시겠습니까?",
          text: "지금 나가시면 다시 로그인해야 합니다.",
          icon: "warning",
          confirmButtonText: "로그아웃",
          confirmButtonColor: "red",
          showCancelButton: true,
          cancelButtonText: "아니오",
          cancelButtonColor: "green",
        });

        if (!result.isConfirmed) {
          return;
        }

        get().logout();
      },

      logout: () => {
        get().stopLoginTimer();

        set({
          memberNo: null,
          memberId: null,
          memberNickname: null,
          role: null,
          memberThumb: null,
          memberStatus: null,
          token: null,
          endTime: null,
          isReady: true,
        });

        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("auth-key");
      },

      startLoginTimer: (endTime) => {
        if (!endTime) return;

        get().stopLoginTimer();

        const remainingTime = Number(endTime) - Date.now();

        if (remainingTime <= 0) {
          get().logout();
          return;
        }

        const alertDelay = Math.max(remainingTime - FIVE_MINUTES, 0);

        alertTimer = setTimeout(() => {
          if (!get().token) return;

          Swal.fire({
            title: "로그인 연장하시겠습니까?",
            text: "로그인 시간이 5분 후에 만료됩니다.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "예",
            cancelButtonText: "아니오",
            confirmButtonColor: "#ff6b00",
            cancelButtonColor: "#777",
          }).then((result) => {
            if (!result.isConfirmed) {
              return;
            }

            axios
              .post(`${import.meta.env.VITE_BACKSERVER}/members/refresh`)
              .then((res) => {
                get().updateToken(res.data.token, res.data.endTime);

                Swal.fire({
                  title: "로그인이 연장되었습니다.",
                  text: "다시 1시간 동안 이용할 수 있습니다.",
                  icon: "success",
                  confirmButtonColor: "#ff6b00",
                });
              })
              .catch(() => {
                get().logout();

                Swal.fire({
                  title: "로그인 연장에 실패했습니다.",
                  text: "다시 로그인해주세요.",
                  icon: "warning",
                  confirmButtonColor: "#ff6b00",
                });
              });
          });
        }, alertDelay);

        logoutTimer = setTimeout(() => {
          if (!get().token) return;

          Swal.close();
          get().logout();

          Swal.fire({
            title: "로그인 시간이 만료되었습니다.",
            text: "자동 로그아웃되었습니다.",
            icon: "warning",
            confirmButtonColor: "#ff6b00",
          });
        }, remainingTime);
      },

      setThumb: (thumb) => {
        set({ memberThumb: thumb });
      },

      setStatus: (status) => {
        set({ memberStatus: status });
      },

      setNickname: (nickName) => {
        set({ memberNickname: nickName });
      },

      setReady: (ready) => {
        set({ isReady: ready });
      },
    }),
    {
      name: "auth-key",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          memberId: state.memberId,
          memberNickname: state.memberNickname,
          role: state.role,
          memberStatus: state.memberStatus,
          memberNo: state.memberNo,
          memberThumb: state.memberThumb,
          token: state.token,
          endTime: state.endTime,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // 예전에 memberRole로 저장된 값이 있으면 role로 옮겨준다.
        if (!state.role && state.memberRole) {
          state.role = state.memberRole;
        }

        state.setReady(true);

        if (state.token) {
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${state.token}`;
          state.startLoginTimer(state.endTime);
        }
      },
    },
  ),
);

export default useAuthStore;
