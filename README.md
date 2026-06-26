
# B2B 베이커리 납품 주문 플랫폼
소규모 카페와 동네 매장을 대상으로 베이커리 상품을 조회하고 대량 주문 및 주문 취소 관리를 할 수 있는 데스크탑 기반 B2B 주문 관리 웹 서비스입니다.
프론트엔드에서는 예상 주문 금액을 계산하여 사용자에게 보여주고, 실제 주문 금액은 백엔드에서 상품 번호를 기준으로 DB 가격을 다시 조회하여 계산하도록 구현했습니다.

현재 시간 관계상 브랜드의 일부 기능과 메뉴, 이벤트 , 상점등의 기능은  
        구현이 미완료된 상태입니다. 



1. 메인화면



<img width="1217" height="858" alt="image" src="https://github.com/user-attachments/assets/c408c199-af4b-451a-b8a2-633a1c588b79" />


2. 빵 상세 페이지



<img width="1255" height="802" alt="image" src="https://github.com/user-attachments/assets/6056dc5a-8b74-4b8f-88a6-833e71cc206a" />
<img width="1290" height="693" alt="image" src="https://github.com/user-attachments/assets/bcf274d2-5185-45e5-9afd-40c9341e04c9" />
<img width="1312" height="681" alt="image" src="https://github.com/user-attachments/assets/65611c18-2d36-43cc-be3c-f596aab397c7" />





3. 주문창




<img width="780" height="836" alt="image" src="https://github.com/user-attachments/assets/76e0aae7-48e7-467f-a20d-a86b5a3293dc" />




4. 관리자 페이지






<img width="1426" height="752" alt="image" src="https://github.com/user-attachments/assets/d94d3d56-cc93-4532-80aa-ceb4faa55191" />
<img width="1382" height="731" alt="image" src="https://github.com/user-attachments/assets/0c6608a0-ae9a-40ef-97c2-da715819e2a9" />
<img width="1385" height="690" alt="image" src="https://github.com/user-attachments/assets/2b00f13c-37b0-4485-aac0-0b981c70e23e" />




5. 마이페이지
--> 주문 취소를 하면 취소요청을 마이페이지에서 확인이 가능하고, 관리자가 승인하면 취소요청 -> 취소 완료로 바뀜 



<img width="1336" height="682" alt="image" src="https://github.com/user-attachments/assets/9ffed2cc-c426-4a63-805a-c7c15fa90e5a" />
<img width="1402" height="682" alt="image" src="https://github.com/user-attachments/assets/f6040079-d227-453d-90f7-3f34ececc34e" />
<img width="1383" height="652" alt="image" src="https://github.com/user-attachments/assets/d714a349-316b-4a7e-9371-f946c55e7a0c" />





전체 ERD





```mermaid
erDiagram
    MEMBER_TBL ||--o{ ORDER_TBL : "orders"
    MEMBER_TBL ||--o{ REVIEW_TBL : "writes"
    MEMBER_TBL ||--o{ ORDER_TBL : "cancel_admin"
    BREAD_TBL ||--o{ ORDER_TBL : "ordered"
    BREAD_TBL ||--o{ REVIEW_TBL : "reviewed"
    BREAD_TBL ||--|| BREAD_DETAIL_TBL : "has detail"
    ORDER_TBL ||--o| REVIEW_TBL : "review target"
    ORDER_TBL ||--o{ ACCOUNT_LOG_TBL : "payment log"

    MEMBER_TBL {
        NUMBER member_no PK
        VARCHAR2 member_id
        VARCHAR2 member_pw
        VARCHAR2 member_name
        VARCHAR2 member_nickname
        VARCHAR2 member_phone
        VARCHAR2 member_email
        VARCHAR2 member_role
        VARCHAR2 role
        VARCHAR2 member_status
        VARCHAR2 member_thumb
        DATE enroll_date
    }

    BREAD_TBL {
        NUMBER bread_no PK
        VARCHAR2 bread_name
        NUMBER bread_price
        VARCHAR2 bread_content
        NUMBER bread_stock
        VARCHAR2 bread_category
        VARCHAR2 bread_status
        VARCHAR2 bread_thumb
        DATE created_date
    }

    BREAD_DETAIL_TBL {
        NUMBER detail_id PK
        NUMBER bread_no FK
        VARCHAR2 serving_size
        NUMBER calories_kcal
        NUMBER carbohydrate_g
        NUMBER sugar_g
        NUMBER protein_g
        NUMBER fat_g
        NUMBER sodium_mg
        CLOB ingredients
        VARCHAR2 allergy_info
        CLOB detail_description
        TIMESTAMP created_at
    }

    ORDER_TBL {
        NUMBER order_no PK
        NUMBER member_no FK
        NUMBER bread_no FK
        NUMBER order_count
        NUMBER total_price
        VARCHAR2 order_status
        DATE order_date
        DATE cancel_requested_at
        DATE cancel_completed_at
        VARCHAR2 cancel_reason
        NUMBER cancel_admin_no FK
    }

    REVIEW_TBL {
        NUMBER review_no PK
        NUMBER bread_no FK
        NUMBER member_no FK
        NUMBER order_no FK
        NUMBER rating
        VARCHAR2 review_content
        CHAR review_status
        DATE created_date
        DATE updated_date
    }

    ACCOUNT_LOG_TBL {
        NUMBER log_no PK
        NUMBER order_no FK
        NUMBER member_no FK
        VARCHAR2 change_type
        NUMBER change_amount
        DATE created_date
    }

    BRAND_TBL {
        NUMBER brand_no PK
        VARCHAR2 brand_name
        VARCHAR2 brand_content
        VARCHAR2 bread_name
    }
```





결제/ 주문 중심 ERD







```mermaid
erDiagram
    MEMBER_TBL ||--o{ ORDER_TBL : "places order"
    BREAD_TBL ||--o{ ORDER_TBL : "ordered bread"
    ORDER_TBL ||--o{ ACCOUNT_LOG_TBL : "creates payment log"
    MEMBER_TBL ||--o{ ACCOUNT_LOG_TBL : "balance changed"
    MEMBER_TBL ||--o{ ORDER_TBL : "approves cancel"

    MEMBER_TBL {
        NUMBER member_no PK
        VARCHAR2 member_id
        VARCHAR2 member_name
        VARCHAR2 member_role
        VARCHAR2 role
        VARCHAR2 member_status
    }

    BREAD_TBL {
        NUMBER bread_no PK
        VARCHAR2 bread_name
        NUMBER bread_price
        NUMBER bread_stock
        VARCHAR2 bread_status
    }

    ORDER_TBL {
        NUMBER order_no PK
        NUMBER member_no FK
        NUMBER bread_no FK
        NUMBER order_count
        NUMBER total_price
        VARCHAR2 order_status
        DATE order_date
        DATE cancel_requested_at
        DATE cancel_completed_at
        VARCHAR2 cancel_reason
        NUMBER cancel_admin_no FK
    }

    ACCOUNT_LOG_TBL {
        NUMBER log_no PK
        NUMBER order_no FK
        NUMBER member_no FK
        VARCHAR2 change_type
        NUMBER change_amount
        DATE created_date
    }
```













