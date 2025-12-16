import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: '120px', textAlign: 'center', color: 'white' }}>
      <h1>Payment successful ✅</h1>
      <p>Your order has been paid in Fondy sandbox mode.</p>
      <button
        style={{ marginTop: '24px' }}
        onClick={() => navigate('/shop')}
      >
        Back to shop
      </button>
    </div>
  );
};

export default PaymentSuccess;
