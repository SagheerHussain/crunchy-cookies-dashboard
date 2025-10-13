import PropTypes from 'prop-types';
import { Card, Table } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

// map status -> soft badge class
const STATUS_CLASS = {
  paid: 'badge-soft-success',
  processing: 'badge-soft-primary',
  shipped: 'badge-soft-info',
  pending: 'badge-soft-warning',
  cancelled: 'badge-soft-danger',
  refunded: 'badge-soft-secondary'
};

const fmtCurrency = (n) => (typeof n === 'number' ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : n);

export default function RecentOrder({ title = 'Recent Orders', height = 360, rows = [] }) {
  return (
    <Card className="recent-orders-card" style={{ height: '475px', backgroundColor: '#111' }}>
      <Card.Header className="d-flex align-items-center justify-content-between" style={{ color: '#fff' }}>
        <Card.Title as="h5" className="mb-0">
          {title}
        </Card.Title>
      </Card.Header>

      <SimpleBar style={{ height }}>
        <Card.Body className="pt-0" style={{ color: '#fff' }}>
          <Table responsive hover className="align-middle mb-0" style={{ backgroundColor: '#111' }}>
            <thead className="sticky-top">
              <tr>
                <th style={{ minWidth: 110, color: '#fff' }}>Order ID</th>
                <th style={{ minWidth: 110, color: '#fff' }} className="text-end">
                  Amount
                </th>
                <th style={{ minWidth: 90, color: '#fff' }} className="text-center">
                  Qty
                </th>
                <th style={{ minWidth: 130, color: '#fff' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const key = String(r.status || '')
                  .toLowerCase()
                  .trim();
                const badgeClass = STATUS_CLASS[key] || 'badge-soft-secondary';
                return (
                  <tr key={r.id || i}>
                    <td className="fw-semibold" style={{ color: '#fff' }}>#{r.id}</td>
                    <td className="text-end" style={{ color: '#fff' }}>{fmtCurrency(r.amount)}</td>
                    <td className="text-center" style={{ color: '#fff' }}>{r.quantity}</td>
                    <td>
                      <span className={`badge badge-soft ${badgeClass}`}>{r.status}</span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No orders to display.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </SimpleBar>
    </Card>
  );
}

RecentOrder.propTypes = {
  title: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      quantity: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired
    })
  )
};
