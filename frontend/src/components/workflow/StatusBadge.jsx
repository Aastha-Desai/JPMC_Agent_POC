function StatusBadge({ status }) {
  const normalizedStatus = status.toLowerCase();

  const statusLabels = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    waiting: "Waiting for Approval",
    blocked: "Blocked",
  };

  const label = statusLabels[normalizedStatus] || status;

  return (
    <span className={`status-badge status-badge--${normalizedStatus}`}>
      {label}
    </span>
  );
}

export default StatusBadge;