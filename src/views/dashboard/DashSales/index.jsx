// react-bootstrap
import { Row, Col, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
// third party
import Chart from 'react-apexcharts';

// project imports
import ProductCard from '../../../components/Widgets/Statistic/ProductCard';
import ProductTable from '../../../components/Widgets/ProductTable';
import { SalesCustomerSatisfactionChartData } from './chart/sales-customer-satisfication-chart';
import { SalesSupportChartData1 } from './chart/sales-support-chart1';
import SalesAmountPanel from './chart/SalesAmountChart';
import productData from '../../../data/productTableData';
import RecentOrder from '../../../components/Widgets/RecentOrder';
import { getOverviewCards } from '../../../api/analytics';

// -----------------------|| DASHBOARD SALES ||-----------------------//
export default function DashSales() {

  const [overviewCards, setOverviewCards] = useState([]);

  const ordersData = [
    { date: '2025-01-03', value: 120 },
    { date: '2025-01-11', value: 80 },
    { date: '2025-02-05', value: 150 }
  ];

  const recentOrders = [
    { id: 10234, amount: 178.5, quantity: 3, status: 'Paid' },
    { id: 10233, amount: 89.0, quantity: 1, status: 'Pending' },
    { id: 10232, amount: 245.0, quantity: 5, status: 'Processing' },
    { id: 10231, amount: 120.0, quantity: 2, status: 'Shipped' },
    { id: 10230, amount: 49.99, quantity: 1, status: 'Cancelled' },
    { id: 10229, amount: 72.0, quantity: 2, status: 'Refunded' }
  ];

  useEffect(() => {
    const fetchOverviewCards = async () => {
      const cards = await getOverviewCards();
      setOverviewCards(cards.data);
    };
    fetchOverviewCards();
  }, []);

  return (
    <>
      <Row>
        <Col md={12}>
          <Row>
            <Col sm={3}>
              <ProductCard
                params={{
                  title: 'Net Profit',
                  primaryText: `$ ${overviewCards?.netProfit}`,
                  secondaryText: 'Total Amount',
                  icon: 'payments',
                  tone: 'neutral'
                }}
              />
            </Col>
            <Col sm={3}>
              <ProductCard
                params={{
                  title: 'Orders Delivered',
                  primaryText: `${overviewCards?.ordersDelivered}`,
                  secondaryText: 'Amount Deposit',
                  icon: 'shopping_bag',
                  tone: 'success'
                }}
              />
            </Col>
            <Col sm={3}>
              <ProductCard
                params={{
                  title: 'Total Products',
                  primaryText: `${overviewCards?.totalProducts}`,
                  secondaryText: 'Amount Spent',
                  icon: 'card_giftcard',
                  tone: 'danger'
                }}
              />
            </Col>
            <Col sm={3}>
              <ProductCard
                params={{
                  title: 'Remaining Amount',
                  primaryText: `$ ${overviewCards?.expectedAmount}`,
                  secondaryText: 'Expected Amount',
                  icon: 'local_offer',
                  tone: 'warning'
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col md={12}>
          <Row>
            <Col>
              <Card className="support-bar overflow-hidden" style={{ height: '450px', backgroundColor: '#111' }}>
                <Card.Body className="pb-0">
                  <h2 className="m-0" style={{ color: '#fff' }}>$2000</h2>
                  <span style={{ color: '#0FB4BB' }}>Total Sales</span>
                  <p className="mb-3 mt-3" style={{ color: '#fff' }}>Number of conversions divided by the total visitors.</p>

                  {/* Filters + Chart */}
                  <SalesAmountPanel data={ordersData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col md={12} xl={6}>
          <Row>
            <Col>
              <Card className="support-bar overflow-hidden" style={{ height: '400px', backgroundColor: '#111' }}>
                <Card.Body className="pb-0">
                  <h2 className="m-0" style={{ color: '#fff' }}>1432</h2>
                  <span style={{ color: '#0FB4BB' }}>Order Delivered</span>
                  <p className="mb-3 mt-3">Number of conversions divided by the total visitors. </p>
                </Card.Body>
                <Chart type="bar" {...SalesSupportChartData1()} />
              </Card>
            </Col>
          </Row>
        </Col>
        <Col md={12} xl={6}>
          <Card style={{ height: '400px', backgroundColor: '#111' }}>
            <Card.Body>
              <h6 style={{ color: '#fff' }}>Customer Satisfaction</h6>
              <span style={{ color: '#fff' }}>It takes continuous effort to maintain high customer satisfaction levels Internal and external.</span>
              <Row className="d-flex justify-content-center align-items-center">
                <Col>
                  <Chart type="pie" {...SalesCustomerSatisfactionChartData()} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} xl={6}>
          <ProductTable {...productData} />
        </Col>
        <Col md={12} xl={6}>
          <RecentOrder title="Recent Orders" height={400} rows={recentOrders} />
        </Col>
      </Row>
    </>
  );
}
