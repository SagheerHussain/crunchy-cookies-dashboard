import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Chip } from '@mui/material';

// react-bootstrap
import { Card, Table } from 'react-bootstrap';

// project import
import SimpleBar from 'simplebar-react';

// -----------------------|| PRODUCT TABLE ||-----------------------//

const SOFT = {
  Success: { color: '#34ff82', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.28)' },
  Pending: { color: '#fc9801', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.28)' },
  Cancel: { color: '#fb2626', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.28)' },
};

export default function ProductTable({ wrapclass, title, height, tableheading, rowdata }) {
  return (
    <Card className={wrapclass} style={{ height: '475px', backgroundColor: '#111' }}>
      <Card.Header>
        <Card.Title as="h5" style={{ color: '#fff' }}>
          {title}
        </Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        <SimpleBar style={{ height: '400px' }}>
          <Table responsive className="mb-0">
            <thead>
              <tr>
                {tableheading.map((x, i) => (
                  <th style={{ color: '#ccc' }} key={i}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowdata.map((y, j) => (
                <tr key={j}>
                  <td style={{ color: '#ccc' }}>{y.name}</td>
                  <td>{y.image}</td>
                  <td>
                    <div>
                      {/* <label className={`badge badge-${y.status.badge}`}>{}</label> */}
                      <Chip
                        size="small"
                        label={y.status.label}
                        variant="outlined"
                        sx={{
                          color: SOFT[y.status.label],
                          background: SOFT[y.status.label].bg,
                          borderColor: SOFT[y.status.label].border,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: SOFT[y.status.label].color }
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ color: '#ccc' }}>{y.price}</td>
                  <td>
                    {y.action.map((z, k) => (
                      <Link to={z.link} key={k}>
                        <i className={`feather icon-${z.icon} f-16 text-${z.textcls} ${k > 0 ? 'ms-3' : ''}`} title="Action" />
                      </Link>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </Card.Body>
    </Card>
  );
}

ProductTable.propTypes = {
  wrapclass: PropTypes.string,
  title: PropTypes.string,
  height: PropTypes.string,
  tableheading: PropTypes.any,
  rowdata: PropTypes.any
};
