import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { menuData } from '../testData/menuData.js';
import searchIcon from '../images/search.png';
import testimage from '../images/testimage.png';
import error404 from '../images/404img.png'; // Твоя картинка для пустих результатів
import './SearchPage.css';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // "Ендпоінт" для майбутнього API
  const SEARCH_ENDPOINT = "/api/search?q="; 

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    // ЛОКАЛЬНИЙ ПОШУК (зараз по JSON)
    const allDishes = [];
    Object.values(menuData).forEach(category => {
      category.subcategories.forEach(sub => {
        sub.items.forEach(item => {
          if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            allDishes.push(item);
          }
        });
      });
    });
    setResults(allDishes);

    /* У МАЙБУТНЬОМУ ДЛЯ API:
    fetch(`${SEARCH_ENDPOINT}${searchQuery}`)
      .then(res => res.json())
      .then(data => setResults(data));
    */
  }, [searchQuery]);

  return (
    <div className="search-page">
      <header className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="search-input-wrapper">
          <img src={searchIcon} alt="search" className="inner-search-icon" />
          <input 
            type="text" 
            placeholder="Пошук" 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="search-results">
        {searchQuery && results.length > 0 ? (
          results.map(item => (
            <div key={item.id} className="dish-item-card search-card">
              <div className="dish-text">
                <h3 className="dish-name">{item.name}</h3>
                <p className="dish-price">{item.price} грн</p>
                <p className="dish-description">{item.desc}</p>
                <span className="dish-meta">{item.weight}</span>
              </div>
              <div className="dish-img-box">
                <img src={item.image || testimage} alt={item.name} className="dish-img" />
              </div>
            </div>
          ))
        ) : searchQuery && results.length === 0 ? (
          <div className="no-results">
            <img src={error404} alt="Not found" className="img-404" />
            <p>Шукали - шукали "{searchQuery}" <br/> не знайшли</p>
          </div>
        ) : (
          <div className="search-placeholder-text">
            Введіть назву страви яку шукаєте
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;