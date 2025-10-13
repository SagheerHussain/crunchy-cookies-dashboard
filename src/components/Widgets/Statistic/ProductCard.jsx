// ProductCard.jsx
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

export default function ProductCard({ params }) {
  const {
    title,
    primaryText,
    secondaryText,
    icon = 'payments',
    tone = 'neutral', // neutral | success | danger | warning
  } = params || {};

  return (
    <Card className={`metric-card mc-${tone}`} style={{ backgroundColor: '#080808' }}>
      <Card.Body className="mc-body">
        <div className="mc-top">
          <div className="mc-icon">
            <i className="material-icons-two-tone">{icon}</i>
          </div>
        </div>

        <div className="mc-content">
          <div className="mc-value">{primaryText}</div>
          <h6 className="mc-title">{title}</h6>
          {secondaryText ? <div className="mc-sub">{secondaryText}</div> : null}
        </div>
      </Card.Body>
    </Card>
  );
}

ProductCard.propTypes = { params: PropTypes.any };
