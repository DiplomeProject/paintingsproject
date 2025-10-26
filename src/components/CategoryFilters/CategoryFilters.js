import React from 'react';
import styles from './CategoryFilters.module.css';

function CategoryFilters({ categories, activeCategory, onCategoryClick }) {
    return (
        <div className={styles.categoryGrid}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.categoryButton} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => onCategoryClick(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}

export default CategoryFilters;