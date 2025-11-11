import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderDetail } from "../../../hooks/orders/useOrders";

const money = (n, curr = "QAR") =>
  `${curr === "QAR" ? "QAR" : curr === "PKR" ? "₨" : "$"} ${Number(
    n || 0
  ).toLocaleString()}`;

const chip = (text, tone) => (
  <span className={`chip ${tone}`}>{String(text || "").toUpperCase()}</span>
);

export default function ViewOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderDetail(id);

  // Safe guards
  const items = order?.items || [];
  const recipients = order?.recipients || [];
  const user = order?.user || {};

  const subTotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it?.totalAmount || 0),
        0
      ),
    [items]
  );

  const deliveryCharges = Number(order?.taxAmount || 0);
  const grandTotal = Number(order?.grandTotal || 0);

  const coupon = order?.appliedCoupon || null;
  const discountValue =
    coupon?.type === "percentage" ? `${coupon.value}%` : coupon?.value || "";

  const payLabel = (order?.payment || "pending").toLowerCase();
  const status = (order?.status || "pending").toLowerCase();

  // Map allocations -> recipient label
  const recipientById = useMemo(() => {
    const map = {};
    recipients.forEach((r) => {
      if (r?._id) map[r._id] = r;
    });
    return map;
  }, [recipients]);

  const statusChipTone =
    status === "pending"
      ? "blue"
      : status === "confirmed"
      ? "green"
      : status === "shipped"
      ? "amber"
      : status === "delivered"
      ? "violet"
      : status === "cancelled"
      ? "rose"
      : "rose";

  const paymentChipTone =
    payLabel === "paid" || payLabel === "partial" ? "green" : "amber";

  return (
    <section id="order_detail">
      <div className="od">
        {/* HEADER */}
        <div className="od__header">
          <div>
            <div className="od__row od__row--center">
              <div className="od_header_left">
                <h2 className="od__title">
                  Order ID: {order?.code || "—"}
                </h2>
                <div className="od__chips">
                  {chip(payLabel, paymentChipTone)}
                  {chip(status, statusChipTone)}
                </div>
              </div>
            </div>

            {/* Placed & Delivery Dates */}
            <div className="od__sub">
              <span style={{ color: "orange" }}>Placed Date : </span>
              {order?.placedAt
                ? new Date(order.placedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "—"}
            </div>
            <div className="od__sub">
              <span style={{ color: "#31d300" }}>Delivery Date : </span>
              {order?.deliveredAt
                ? new Date(order.deliveredAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "—"}
            </div>
          </div>
        </div>

        <div className="od__grid">
          {/* LEFT */}
          <div className="od__left">
            {/* ITEMS */}
            <section className="card">
              <div className="card__head">
                <div className="od__row od__row--center">
                  <span>{chip(status, statusChipTone)}</span>
                  <h3>Order Item</h3>
                </div>
              </div>
              <p className="muted">
                Personalized breakdown of items & allocations.
              </p>

              {isLoading ? (
                <div className="skeleton skeleton--list" />
              ) : items.length ? (
                items.map((it) => {
                  const p = it.product || {};
                  const allocs = it.allocations || [];
                  return (
                    <div className="li" key={it?._id}>
                      <div className="li__left">
                        <img
                          className="li__img"
                          src={p.featuredImage || p.images?.[0]?.url}
                          alt={p.title || "Product"}
                        />
                        <div>
                          <div className="li__title">
                            <span className="li__name">
                              {p.title || "Product"}
                            </span>
                          </div>
                          <div className="li__opts">
                            <span
                              style={{
                                fontSize: "16px",
                                padding: "6px 0",
                              }}
                            >
                              QAR {Number(p.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div
                          className="li__mid"
                          style={{
                            textAlign: "right",
                            marginBottom: "6px",
                          }}
                        >
                          <span className="li__qty">
                            Qty: {it.quantity}
                          </span>
                        </div>
                        <div className="li__right">
                          <span className="li__price">
                            QAR {Number(it.totalAmount || 0)}
                          </span>
                        </div>

                        {/* Allocations: which recipient got how many */}
                        {allocs.length > 0 && (
                          <div className="muted" style={{ marginTop: 6 }}>
                            {allocs.map((a, idx) => {
                              const r = recipientById[a.recipientId] || {};
                              return (
                                <div
                                  key={idx}
                                  style={{ fontSize: "11px" }}
                                >
                                  {r.label || "Recipient"} ({r.phone || ""})
                                  {" → "}
                                  {a.quantity}
                                </div>
                              );
                            })}
                          </div>
                        )}
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
              <div
                className="card__head"
                style={{ marginBottom: "20px" }}
              >
                <h3>Order Summary</h3>
                <span>
                  Payment : {chip(payLabel, paymentChipTone)}
                </span>
              </div>

              {/* Coupon row */}
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: "18px" }}>Coupon:</span>
                <div className="couponbar__codes">
                  <span className="code">
                    {coupon?.code || "—"}
                  </span>
                </div>
              </div> */}

              <div className="summary">
                <div className="row">
                  <span style={{ fontSize: "18px" }}>Subtotal</span>
                  <span className="muted">
                    {order?.totalItems || items.length} item
                    {(order?.totalItems || items.length) !== 1
                      ? "s"
                      : ""}
                  </span>
                  <span>{money(subTotal, "QAR")}</span>
                </div>

                {/* <div className="row">
                  <span style={{ fontSize: "18px" }}>Discount</span>
                  <span className="muted">
                    {coupon?.code ? "Applied coupon" : "—"}
                  </span>
                  <span
                    className={`neg ${
                      discountValue ? "" : "muted"
                    }`}
                  >
                    {discountValue
                      ? `-${discountValue}`
                      : "—"}
                  </span>
                </div> */}

                <div className="row">
                  <span style={{ fontSize: "18px" }}>
                    Delivery Charges
                  </span>
                  <span className="muted"></span>
                  <span>{money(deliveryCharges, "QAR")}</span>
                </div>

                <div className="divider" />
                <div className="row total">
                  <span style={{ fontSize: "18px" }}>
                    Grand Total
                  </span>
                  <span />
                  <span>QAR {grandTotal}</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="od__right">
            {/* Cancel Reason */}
            {order?.cancelReason && (
              <section className="card">
                <div className="card__head">
                  <h4>Cancel Reason</h4>
                </div>
                <p className="muted">
                  {order.cancelReason || "—"}
                </p>
              </section>
            )}

            {/* Satisfaction */}
            {order?.satisfaction && (
              <section className="card">
                <div className="card__head">
                  <h4>Customer Satisfaction</h4>
                </div>
                <p className="muted">
                  {order.satisfaction || "—"}
                </p>
              </section>
            )}

            {/* Customer */}
            <section className="card">
              <div className="card__head">
                <h4>Customers</h4>
              </div>
              <div className="cust">
                <div className="cust__name">
                  {(user.firstName || user.firstname || "") +
                    " " +
                    (user.lastName ||
                      user.lastname ||
                      "") || "Guest"}
                </div>
                <div
                  className="muted"
                  style={{ margin: "10px 0" }}
                >
                  {order?.totalItems
                    ? `${order.totalItems} Items`
                      : "1 Item"}
                </div>
                <div className="muted">
                  {order?.taxAmount
                    ? ""
                    : ""}
                </div>
              </div>
            </section>

            {/* Sender + Recipients (instead of single shippingAddress) */}
            <section className="card">
              <div className="card__head">
                <h4>Sender & Recipients</h4>
              </div>
              <div className="">
                <div
                  style={{
                    margin: "10px 0",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#fff",
                  }}
                >
                  Sender Phone :
                  <span>{order?.senderPhone || "—"}</span>
                </div>

                {recipients.length ? (
                  <div
                    style={{
                      fontSize: "13px",
                      marginTop: 4,
                      color: "#fff",
                    }}
                  >
                    {recipients.map((r) => (
                      <div
                        key={r._id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span>
                          {r.label || "Recipient"}:
                        </span>
                        <span>{r.phone || "—"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="muted">No recipients.</div>
                )}
              </div>
            </section>

            {/* Card Information (per recipient) */}
            <section className="card">
              <div className="card__head">
                <h4>Card Information</h4>
              </div>
              <div className="">
                {recipients.length ? (
                  recipients.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        margin: "10px 0",
                        paddingBottom: 8,
                        borderBottom:
                          "1px solid rgba(255,255,255,0.06)",
                        fontSize: "13px",
                        color: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <strong>
                          {r.label || "Recipient"}
                        </strong>
                        <span>{r.phone || ""}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span>Card Message: </span>
                        <span>
                          {r.cardMessage || "—"}
                        </span>
                      </div>
                      {r.cardImage && (
                        <div style={{ marginTop: 2 }}>
                          Image:{" "}
                          <a
                            href={r.cardImage}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      style={{
                        margin: "10px 0 0",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#fff",
                      }}
                    >
                      <p>Card Message :</p>
                      <p>{order?.cardMessage || "—"}</p>
                    </div>
                    {order?.cardImage && (
                      <div
                        style={{
                          fontSize: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#fff",
                        }}
                      >
                        Image:{" "}
                        <a
                          href={order.cardImage}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
