export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="layout">
        <div className="footer-bottom">
          <p>&copy; {currentYear} BitEstate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
