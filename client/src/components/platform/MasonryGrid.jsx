import React, { useState, useEffect } from 'react';

export default function MasonryGrid({ items, renderItem }) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setCols(1);
      else if (window.innerWidth <= 1200) setCols(2);
      else setCols(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = Array.from({ length: cols }, () => []);
  
  items.forEach((item, index) => {
    columns[index % cols].push(item);
  });

  return (
    <div className="masonry-grid-container" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
      {columns.map((col, i) => (
        <div key={i} className="masonry-grid-column" style={{ display: 'flex', flexDirection: 'column', gap: '28px', flex: 1, minWidth: 0 }}>
          {col.map((item, index) => renderItem(item, index))}
        </div>
      ))}
    </div>
  );
}
