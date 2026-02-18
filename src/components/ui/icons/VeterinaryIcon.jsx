const VeterinaryIcon = ({ size = 48, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="14" r="4" />
    <circle cx="6" cy="8" r="2" />
    <circle cx="18" cy="8" r="2" />
  </svg>
);

export default VeterinaryIcon;