import styles from "./MenuPage.module.css";

const MenuPage = () => {
  return (
    <div className={styles.menu_wrap}>
      <h1 className="page-title">메뉴 페이지 입니다.</h1>

      <span>
        <h2>메뉴를 준비중에 있습니다.</h2>
      </span>
      <h2>조속히 빠른 시일내에 뵙겠습니다.</h2>
    </div>
  );
};
export default MenuPage;
