package com.example.Bread_project.bread.controller;

import com.example.Bread_project.bread.service.BreadService;
import com.example.Bread_project.bread.vo.Bread;
import com.example.Bread_project.member.model.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "breads")
public class BreadController {
    @Autowired
    private BreadService breadService;
    @Autowired
    private MemberService memberService;

    //데이터배이스에 들어가 있는 빵목록을 가져오기 위한 로직
    @GetMapping
    //전체 조회는 body를 안받음. 왜냐하면 특정하나가 아니라 전체 리스트를 받아오기 떄문에
    //즉 반환값은 빵 1개 Bread가 아니라 목록 List<Bread>:
    public ResponseEntity<?> selectBreadList(){
        List<Bread> list = breadService.selectBreadList();
        return ResponseEntity.ok(list);
    }

    //빵 상세 조회
    @GetMapping(value = "/{breadNo}")
    //@PathVariable: "어떤 데이터 하나를 딱 집어서 가져오고 싶어!" 할 때 사용하는 것
    //예를 들어 /breads/5 (5번 빵이라는 고유한 자원)-> 이렇게 특정 하나를 조회할 떄 사용
    //@RequestParam: 데이터 목록 중에 이런 조건인 것들만 추려줘!" 할 때 사용하는 것
    //예를 들어 크림빵들만 목록으로 보여줘와 같은 형식 -> 크림빵이 조건으로 설정되어 보여지게 되는 것
    public ResponseEntity<?> selectOneBread(@PathVariable int breadNo){
        Bread bread = breadService.selectOneBread(breadNo);
        if(bread != null){
            return ResponseEntity.ok(bread);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 빵을 찾을 수 없습니다.");
    }
}
