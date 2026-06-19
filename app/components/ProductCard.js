'use client';

export default function ProductCard({ product, index }) {
  const getBadge = () => {
    if (product.badge === 'top')    return { label: '🏆 Top Pick',    cls: 'badge-top' };
    if (product.badge === 'value')  return { label: '💎 Best Value',  cls: 'badge-value' };
    if (product.badge === 'budget') return { label: '💰 Budget Pick', cls: 'badge-budget' };
    return null;
  };
  const badge = getBadge();

  const renderStars = (rating) => {
    if (!rating) return null;
    const num = parseFloat(rating);
    const full = Math.floor(num);
    const half = num % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  const formatPrice = (price) => {
    if (!price) return 'Price N/A';
    if (typeof price === 'string' && (price.includes('₹') || price.includes('Rs'))) return price;
    if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
    return price;
  };

  // SerpAPI returns the URL under different field names depending on engine/version
  const productUrl = product.link || product.product_link || product.serpapi_link || null;

  const handleCardClick = () => {
    if (productUrl) {
      window.open(productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`product-card ${productUrl ? 'product-card-clickable' : ''}`}
      onClick={handleCardClick}
      role={productUrl ? 'link' : undefined}
      tabIndex={productUrl ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      aria-label={productUrl ? `View deal for ${product.title}` : product.title}
    >
      {badge && <span className={`product-badge ${badge.cls}`}>{badge.label}</span>}

      {/* Fixed-height image area */}
      <div className="product-img-wrap">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title || 'Product'}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-img-fallback"
          style={{ display: product.thumbnail ? 'none' : 'flex' }}
        >
          🛍️
        </div>
      </div>

      {/* Card body */}
      <div className="product-info">
        {product.source && <div className="product-store">{product.source}</div>}

        <div className="product-name">{product.title}</div>

        <div className="product-price">{formatPrice(product.price)}</div>

        {product.rating && (
          <div className="product-rating">
            <span className="stars">{renderStars(product.rating)}</span>
            <span>{product.rating}{product.reviews ? ` (${product.reviews})` : ''}</span>
          </div>
        )}

        <div className={`product-btn ${!productUrl ? 'product-btn-disabled' : ''}`}>
          {productUrl ? 'View Deal →' : 'No link available'}
        </div>
      </div>
    </div>
  );
}
