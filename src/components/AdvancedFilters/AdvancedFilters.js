import React, { useState } from 'react';
import styles from './AdvancedFilters.module.css';

function AdvancedFilters({ filterConfig }) {
    const [openSubMenu, setOpenSubMenu] = useState(null);

    return (
        <div className={styles.filtersContainer}>
            {filterConfig.map((column, index) => (
                <div key={column.title} className={styles.filterColumn}>
                    <h4 className={styles.columnTitle}>{column.title}</h4>
                    <ul className={styles.filterList}>
                        {column.options.map(opt => (
                            <li
                                key={opt.name}
                                className={`${styles.filterItem} ${opt.subOptions ? styles.hasSubMenu : ''}`}
                                onClick={() => opt.subOptions && setOpenSubMenu(openSubMenu === opt.name ? null : opt.name)}
                            >
                                {opt.name}
                                {opt.subOptions && <span>{openSubMenu === opt.name ? '‹' : '›'}</span>}

                                {opt.subOptions && (
                                    <div className={`
                                        ${styles.subList} 
                                        ${openSubMenu === opt.name ? styles.open : ''}
                                        ${index === filterConfig.length - 1 ? styles.opensLeft : ''} 
                                    `}>
                                        {opt.subOptions.map(subOpt => (
                                            <li key={subOpt} className={styles.subItem}>{subOpt}</li>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default AdvancedFilters;