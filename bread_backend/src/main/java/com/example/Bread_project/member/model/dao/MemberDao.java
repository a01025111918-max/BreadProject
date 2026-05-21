package com.example.Bread_project.member.model.dao;



import com.example.Bread_project.member.model.vo.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberDao {

    int insertJoin(Member member);

    Member selectOneMember(String member);

    Member selectOneMemberByNo(Integer memberNo);

    Member selectOneMemberId(String memberId);

    String findIdByEmail(String memberEmail);

    //기본적으로 mybaits에서는 값을 하나밖에 보내지 못함. 그런데 @Param을 쓰게되면 값을 두개를 보낼 수 있음.
     Integer existByIdAndEmail(@Param("memberId") String memberId, @Param("memberEmail") String memberEmail);
}
