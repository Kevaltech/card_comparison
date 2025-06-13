import React from "react";

const PendingApproval = () => {
  return (
    <div className="pending-approval-container">
      <div className="icon-container">
        <i className="fa fa-clock-o" aria-hidden="true"></i>
      </div>

      <h2>Your Account is Pending Approval</h2>

      <div className="approval-info">
        <p>
          Your registration request has been submitted to our administrators for
          review.
        </p>
        <p>
          You'll receive an email notification once your account is approved.
        </p>
        <p>This typically takes 1-2 business days.</p>
      </div>

      <div className="contact-info">
        <p>
          If you have any questions or need immediate access, please contact:
        </p>
        <p>
          <strong>System Administrator:</strong> admin@yourcompany.com
        </p>
      </div>

      <a href="/" className="btn btn-secondary">
        Return to Home
      </a>
    </div>
  );
};

export default PendingApproval;
