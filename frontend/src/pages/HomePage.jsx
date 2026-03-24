import { Link } from 'react-router-dom';
import { menuData } from '../testData/menuData.js';
import Header from '../components/Header/Header.jsx';
import AboutRestourant from '../components/AboutRestourant/AboutRestourant.jsx';
import '../css/main.css';


function HomePage() {
  const categories = Object.keys(menuData);

  return (
    <div className="App">
      <Header/>
      <main className="menu-container">
        {categories.map((key) => (
          <Link to={`/category/${key}`} key={key} className="menu-item-link">
            <button className="menu-item-btn">
              <span className="menu-item-text">{menuData[key].title}</span>
              <svg className="menu-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Link>
        ))}
        <AboutRestourant />
      </main>
    </div>
  );
}

export default HomePage;