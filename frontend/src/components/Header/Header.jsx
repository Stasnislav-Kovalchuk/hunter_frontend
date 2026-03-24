import './Header.css';
import mainImage from '../../images/mainImage.png';
import logo from '../../images/logo.png';

function Header() {
  return (
    <header className="header">
      <div className="header__banner">
        <img src={mainImage} alt="Hunter Hotel" className="header__banner-img" />
      </div>

      <div className="header__card">
        <div className="header__card-top">
          <div className="header__logo-container">
            <img src={logo} alt="Logo" className="header__logo-img" />
          </div>
          <div className="header__info">
            <h1 className="header__title">Готель - ресторан "Хантер"</h1>
            <p className="header__address">вул. Дружби 136/2В, Шегині</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;