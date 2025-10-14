import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '../../../hooks/orders/useOrders';

const money = (n, curr = 'USD') => `${curr === 'QAR' ? 'ر.ق' : curr === 'PKR' ? '₨' : '$'}${Number(n || 0).toLocaleString()}`;

const chip = (text, tone) => (
  <span className={`chip ${tone}`}>
    {text
      ?.split(' ')
      ?.map((c) => c.charAt(0).toUpperCase() + c.slice(1))
      ?.join('')}
  </span>
);

export default function ViewOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderDetail(id);

  const items = order?.items?.products ?? [];
  const discount = order?._derived?.discount ?? 0;
  const shipping = order?._derived?.shipping ?? 0;

  const currency = items?.[0]?.products?.[0]?.currency || 'USD';
  const payLabel = order?.payment || 'Pending';

  return (
    <section id="order_detail">
      <div className="od">
        {/* HEADER */}
        <div className="od__header">
          <div>
            <div className="od__row od__row--center">
              <div className="od_header_left">
                <h2 className="od__title">Order ID: {order?.code || '—'}</h2>
                <div className="od__chips">
                  {payLabel === 'Pending' ? chip(payLabel, 'amber') : chip(payLabel, 'green')}
                  {order?.status === 'pending'
                    ? chip(order?.status, 'blue')
                    : order?.status === 'confirmed'
                      ? chip(order?.status, 'green')
                      : order?.status === 'shipped'
                        ? chip(order?.status, 'amber')
                        : order?.status === 'delivered'
                          ? chip(order?.status, 'violet')
                          : order?.status === 'cancelled'
                            ? chip(order?.status, 'rose')
                            : chip(order?.status, 'rose')}
                </div>
              </div>
            </div>
            <div className="od__sub">January 8, 2024 at 9:48 pm from Draft Orders</div>
          </div>
        </div>

        <div className="od__grid">
          {/* LEFT */}
          <div className="od__left">
            {/* ITEMS */}
            <section className="card">
              <div className="card__head">
                <div className="od__row od__row--center">
                  <span className="">
                    {order?.status === 'pending'
                      ? chip(order?.status, 'blue')
                      : order?.status === 'confirmed'
                        ? chip(order?.status, 'green')
                        : order?.status === 'shipped'
                          ? chip(order?.status, 'amber')
                          : order?.status === 'delivered'
                            ? chip(order?.status, 'violet')
                            : order?.status === 'cancelled'
                              ? chip(order?.status, 'rose')
                              : chip(order?.status, 'rose')}
                  </span>
                  <h3>Order Item</h3>
                </div>
              </div>
              <p className="muted">Use this personalized guide to get your store up and running.</p>

              {/* LINE ITEMS */}
              {isLoading ? (
                <div className="skeleton skeleton--list" />
              ) : items.length ? (
                items.map((it) => {
                  return (
                    <div className="li" key={it?._id}>
                      <div className="li__left">
                        <img className="li__img" src={it?.featuredImage} alt={it?.title} />
                        <div>
                          <div className="li__title">
                            <span className="li__name">{it?.title}</span>
                          </div>
                          <div className="li__opts">
                            <span style={{ fontSize: '16px', padding: '6px 0' }}>
                              {it?.currency} {it?.price?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="li__mid" style={{ textAlign: 'right', marginBottom: '6px' }}>
                          <span className="li__qty">Qty: {order?.items?.quantity}</span>
                        </div>
                        <div className="li__right">
                          <span className="li__price">
                            {it?.currency} {order?.items?.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="muted">No items.</div>
              )}
            </section>

            {/* SUMMARY */}
            <section className="card">
              <div className="card__head" style={{ marginBottom: '20px' }}>
                <h3>Order Summary</h3>
                <span>
                  Payment :{' '}
                  {payLabel === 'Pending' ? chip(payLabel, 'amber') : chip(payLabel, 'green')}
                </span>
              </div>

              {/* Discount + coupon line */}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px' }}>Coupon:</span>
                <div className="couponbar__codes">
                  <span className="code">{order?.appliedCoupon}</span>
                </div>
              </div>

              <div className="summary">
                <div className="row">
                  <span style={{ fontSize: '18px' }}>Subtotal</span>
                  <span className="muted">
                    {order?.totalItems} item{items.length !== 1 ? 's' : ''}
                  </span>
                  <span>QAR {order?.totalAmount}</span>
                </div>
                <div className="row">
                  <span style={{ fontSize: '18px' }}>Discount</span>
                  <span className="muted">{order?.appliedCoupon ? 'Applied coupon' : '—'}</span>
                  <span className={`neg ${discount ? '' : 'muted'}`}>-{order?.items?.avgDiscount}%</span>
                </div>
                <div className="row">
                  <span style={{ fontSize: '18px' }}>Shipping</span>
                  <span className="muted">{shipping ? '' : ''}</span>
                  <span>{money(shipping, currency)}</span>
                </div>
                <div className="row">
                  <span style={{ fontSize: '18px' }}>Tax Deduction</span>
                  <span className="muted">{shipping ? '' : ''}</span>
                  <span>QAR {order?.taxAmount}</span>
                </div>
                <div className="divider" />
                <div className="row total">
                  <span style={{ fontSize: '18px' }}>Grand Total</span>
                  <span />
                  <span>QAR {order?.totalAmount + order?.taxAmount}</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="od__right">
            <section className="card">
              <div className="card__head">
                <h4>Delivery Instructions</h4>
              </div>
              <p className="muted">{order?.deliveryInstructions || '—'}</p>
            </section>

            <section className="card">
              <div className="card__head">
                <h4>Customers</h4>
              </div>
              <div className="cust">
                <div className="cust__name">{order?.user?.firstname || 'Guest'}</div>
                <div className="muted" style={{ margin: '10px 0' }}>
                  {order?.totalItems ? `${order.totalItems} Orders` : '1 Order'}
                </div>
                <div className="muted">{order?.taxAmount ? 'Customer is tax-exempt' : ''}</div>
              </div>
            </section>

            <section className="card">
              <div className="card__head">
                <h4>Shipping Address</h4>
              </div>
              <div className="">
                <div
                  style={{
                    margin: '10px 0',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#fff'
                  }}
                >
                  Sender Phone : <span>{order?.shippingAddress?.senderPhone}</span>
                </div>
                <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                  Receiver Phone : <span>{order?.shippingAddress?.receiverPhone}</span>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card__head">
                <h4>Card Information</h4>
              </div>
              <div className="">
                <div
                  style={{
                    margin: '10px 0 0',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#fff'
                  }}
                >
                  <p>Card Message :</p>
                  <p>{order?.cardMessage}</p>
                </div>
                <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                  Image :{' '}
                  <a href={order?.cardImage} target="_blank">
                    View
                  </a>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
