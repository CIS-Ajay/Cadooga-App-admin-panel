import React from 'react';
import '../../styles/SearchBar.css';

const SearchBar = ({ 
  placeholder = "Search", 
  value, 
  onChange, 
  className = "",
  disabled = false 
}) => {
  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-box">
        <input 
          type="text" 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchBar;