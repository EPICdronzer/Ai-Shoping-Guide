'use client';

function extractSpecs(title) {
  const specs = {
    processor: 'N/A',
    memory: 'N/A',
    storage: 'N/A',
    gpu: 'N/A',
    other: 'N/A',
  };

  const lower = title.toLowerCase();

  // Processor
  const cpuMatch = title.match(/(ryzen\s*\d+|i[3579]-?\d+\w*|intel\s*core|m[123]\s*(pro|max)?|snapdragon\s*\d+|dimensity\s*\d+|bionic\s*\d+)/i);
  if (cpuMatch) specs.processor = cpuMatch[0];

  // RAM / Memory
  const ramMatch = title.match(/(\d+\s*gb)\s*(ram|lpddr\d*)/i) || title.match(/\b(\d+gb)\b/i);
  if (ramMatch) specs.memory = ramMatch[1];

  // Storage
  const storageMatch = title.match(/(\d+\s*(tb|gb))\s*(ssd|nvme|emmc|rom|storage)/i) || title.match(/\b(\d+(gb|tb)\s*ssd)\b/i) || title.match(/\b(128gb|256gb|512gb|1tb)\b/i);
  if (storageMatch) specs.storage = storageMatch[1];

  // GPU / Graphics
  const gpuMatch = title.match(/(rtx\s*\d+|gtx\s*\d+|radeon|intel\s*iris|arc|gpu)/i);
  if (gpuMatch) specs.gpu = gpuMatch[0];

  // Display / Other details
  const displayMatch = title.match(/(\d+(\.\d+)?\s*(inch|"-inch|cm|''))/i) || title.match(/\b(\d{2,3}hz)\b/i);
  if (displayMatch) specs.other = displayMatch[0];

  return specs;
}

export default function CompareModal({ products, onClose }) {
  if (!products || products.length === 0) return null;

  const productSpecs = products.map((p) => ({
    ...p,
    specs: extractSpecs(p.title),
  }));

  const formatPrice = (price) => {
    if (!price) return 'Price N/A';
    if (typeof price === 'string' && (price.includes('₹') || price.includes('Rs'))) return price;
    if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
    return price;
  };

  // Find lowest price to highlight
  const prices = products.map((p) => p.extracted_price || null).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <div className="compare-overlay" role="dialog" aria-modal="true">
      <div className="compare-modal">
        <div className="compare-header">
          <div className="compare-header-title">⚖️ Product Comparison</div>
          <button className="compare-close-btn" onClick={onClose} aria-label="Close comparison">✕</button>
        </div>

        <div className="compare-body">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="feature-col">Feature</th>
                {productSpecs.map((p, idx) => (
                  <th key={idx} className="product-col">
                    <div className="compare-prod-card">
                      <div className="compare-prod-img-wrap">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.title} />
                        ) : (
                          <div className="compare-prod-fallback">🛍️</div>
                        )}
                      </div>
                      <div className="compare-prod-store">{p.source}</div>
                      <div className="compare-prod-title" title={p.title}>{p.title}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-name">Price</td>
                {productSpecs.map((p, idx) => {
                  const isLowest = p.extracted_price && p.extracted_price === minPrice;
                  return (
                    <td key={idx} className="feature-val price-val">
                      <span className={isLowest ? 'lowest-price-tag' : ''}>
                        {formatPrice(p.price)}
                      </span>
                      {isLowest && <span className="lowest-badge">🔥 Lowest</span>}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="feature-name">Rating</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val">
                    {p.rating ? (
                      <div className="compare-rating-wrap">
                        <span className="stars">★</span>
                        <span>{p.rating} {p.reviews ? `(${p.reviews} reviews)` : ''}</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Processor / CPU</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val spec-text">{p.specs.processor}</td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Memory (RAM)</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val spec-text">{p.specs.memory}</td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Storage</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val spec-text">{p.specs.storage}</td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Graphics (GPU)</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val spec-text">{p.specs.gpu}</td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Display / Screen</td>
                {productSpecs.map((p, idx) => (
                  <td key={idx} className="feature-val spec-text">{p.specs.other}</td>
                ))}
              </tr>
              <tr>
                <td className="feature-name">Action</td>
                {productSpecs.map((p, idx) => {
                  const productUrl = p.link || p.product_link || p.serpapi_link || null;
                  return (
                    <td key={idx} className="feature-val">
                      {productUrl ? (
                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="compare-deal-btn"
                        >
                          View Deal
                        </a>
                      ) : (
                        <button disabled className="compare-deal-btn disabled">N/A</button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
