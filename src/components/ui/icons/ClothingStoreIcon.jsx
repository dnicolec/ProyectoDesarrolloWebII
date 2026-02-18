const ClothingStoreIcon = ({ size = 48, className = '', ...props }) => (
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
    <path d="M6 2l3 4h6l3-4" />
    <path d="M4 6h16l-2 16H6L4 6z" />
  </svg>
);

export default ClothingStoreIcon;