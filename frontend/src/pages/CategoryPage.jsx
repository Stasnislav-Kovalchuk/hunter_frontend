import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { menuData } from '../testData/menuData.js';
import logo from '../images/logo.png';
import testimage from '../images/testimage.png';
import testimage2 from '../images/testimage2.png';
import search from '../images/search.png';
import './CategoryPage.css';
import '../css/dishmodal.css'
import AboutRestourant from '../components/AboutRestourant/AboutRestourant.jsx';

function CategoryPage() {
  const { categoryId } = useParams();
  const data = menuData[categoryId];
  const [activeSub, setActiveSub] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null); // Для модалки
  const sectionRefs = useRef([]);

  // Закриття модалки при кліку на "назад" або зміні категорії
  useEffect(() => {
    setSelectedDish(null);
    setIsDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [categoryId]);

  useEffect(() => {
    // Функція для скролу активної кнопки в каруселі
    const scrollTabIntoView = () => {
      const activeTab = document.querySelector('.carousel-tab.active');
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Знаходимо всі видимі секції
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Беремо ту секцію, яка ближче до верху екрана (але під каруселлю)
          const priorityEntry = visibleEntries.reduce((prev, curr) => {
            return (prev.boundingClientRect.top > curr.boundingClientRect.top) ? curr : prev;
          });

          const index = sectionRefs.current.indexOf(priorityEntry.target);
          if (index !== -1) {
            setActiveSub(index);
            // Використовуємо setTimeout, щоб дати React оновити клас .active перед скролом
            setTimeout(scrollTabIntoView, 50);
          }
        }
      },
      { 
        // threshold: 0 означає "спрацювати, як тільки з'явився бодай 1 піксель"
        threshold: 0, 
        // Відступ зверху (-120px) щоб не спрацьовувало під шапкою, 
        // і невеликий відступ знизу (-40%), щоб дати шанс коротким секціям
        rootMargin: "-130px 0px -40% 0px" 
      }
    );

    // Очищаємо старі рефи перед новим спостереженням (важливо при зміні категорії)
    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [categoryId, data.subcategories.length]);

  // Функція для блокування скролу фону, коли модалка відкрита
  useEffect(() => {
    if (selectedDish) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedDish]);

  if (!data) return <div className="error-msg">Категорію не знайдено</div>;

  const scrollToSection = (index) => {
    setActiveSub(index);
    sectionRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="category-page">
      <header className="category-top-nav">
        <Link to="/"><img src={logo} alt="Logo" className="nav-icon-img" /></Link>
        <Link to="/search">
          <button className="nav-search-btn">
              <img src={search} alt="Search" className="nav-search-icon" />
          </button>
        </Link>
      </header>

      <div className="main-selector-container">
        <div className="custom-dropdown">
          <div 
            className={`dropdown-selected-box ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="dropdown-label">{data.title}</span>
            <svg className={`arrow-icon ${isDropdownOpen ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isDropdownOpen && (
            <div className="dropdown-list">
              {Object.keys(menuData)
                .filter((key) => key !== categoryId)
                .map((key) => (
                  <Link 
                    key={key} 
                    to={`/category/${key}`} 
                    className="dropdown-option"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {menuData[key].title}
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="subcategory-carousel">
        {data.subcategories.map((sub, index) => (
          <button 
            key={index} 
            className={`carousel-tab ${activeSub === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <main className="all-dishes-list">
        {data.subcategories.map((sub, subIndex) => (
          <section key={subIndex} ref={(el) => (sectionRefs.current[subIndex] = el)} className="subcategory-section">
            <h2 className="section-title">{sub.name}</h2>
            {sub.items.map((item) => (
              <div 
                key={item.id} 
                className="dish-item-card" 
                onClick={() => setSelectedDish(item)} // ВІДКРИТТЯ МОДАЛКИ
              >
                <div className="dish-text">
                  <h3 className="dish-name">{item.name}</h3>
                  <p className="dish-price">{item.price} грн</p>
                  <p className="dish-description">{item.desc}</p>
                  <span className="dish-meta">{item.weight}</span>
                </div>
                <div className="dish-img-box">
                  <img src={testimage} alt={item.name} className="dish-img" />
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>

      {/* МОДАЛЬНЕ ВІКНО */}
      {selectedDish && (
        <div className="modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDish(null)}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-scroll-area">
              <img src={testimage2} alt={selectedDish.name} className="modal-main-img" />
              
              <div className="modal-info">
                <h3 className="modal-title">{selectedDish.name}</h3>
                <p className="modal-price">{selectedDish.price} грн</p>
                
                <p className="modal-desc">{selectedDish.desc}</p>
                <p className="modal-weight">{selectedDish.weight}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AboutRestourant />
    </div>
  );
}

export default CategoryPage;