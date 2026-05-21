import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer_wrap}>
      <div className={styles.footer_content}>
        <p>copyright @2023 bread all rights reserved </p>
      </div>
    </footer>
  );
};
export default Footer;
