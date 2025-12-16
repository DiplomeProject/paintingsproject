import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFail = () => {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: '120px', textAlign: 'center', color: 'white' }}>
      <h1>Payment failed ❌</h1>
      <p>Something went wrong. Please try again.</p>
      <button
        style={{ marginTop: '24px' }}
        onClick={() => navigate('/checkout')}
      >
        Return to checkout
      </button>
    </div>
  );
};

export default PaymentFail;
