import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      memberNo: null,
      memberId: null,
      memberNickname: null,
      memberRole: null,
      memberThumb: null,
      memberStatus: null,
      token: null,
      endTime: null,
      isReady: false,
      login: ({
        memberNo,
        memberId,
        memberNickname,
        memberRole,
        memberThumb,
        memberStatus,
        token,
        endTime,
      }) => {
        set({
          memberNo,
          memberId,
          memberNickname,
          memberRole,
          memberThumb,
          memberStatus,
          token,
          endTime,
        });
      },
      logout: () => {
        set({
          memberNo: null,
          memberId: null,
          memberNickname: null,
          memberRole: null,
          memberThumb: null,
          memberStatus: null,
          token: null,
          endTime: null,
        });
      },
      //thumb만 수정 로직을 따로 짜는 이유.
      //-> 왜냐하면 이미지는 자주 수정하기 버튼을 누를 수 있는데
      //-> 문제는 기존 로그인 로직에서는 한번에 전체 수정이 이루어지게 된다는 점
      //-> 이미지만 바꾸면 되는데 전체까지 건들이게 되면 귀찮고 나중에 유지보수가
      //-> 지옥이 될 가능성이 높기 떄문에, 이미지만 따로 부분 수정이 가능하게 셋팅하는 것이다.
      //-> 그 뒤에 있는 상태와 닉네임도 마찬가지다. 자주 바뀔 것 같은 요소들은 이렇게 미리 부분 수정 셋팅을 만들어두는게 좋다

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

      //디버깅용
      onRehydrateStorage: () => (state) => {
        console.log("로컬 스토리지에서 데이터를 불러왔습니다:", state);
      },
      partialize: (state) => {
        return {
          memberId: state.memberId,
          memberNickname: state.memberNickname,
          memberRole: state.memberRole,
          memberStatus: state.memberStatus,
          memberNo: state.memberNo,
          memberThumb: state.memberThumb,
          token: state.token,
          endTime: state.endTime,
        };
      },
    },
  ),
);

export default useAuthStore;
