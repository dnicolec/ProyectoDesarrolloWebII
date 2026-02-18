const TagIcon = ({ size = 40, className = '', ...props }) => (
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
    <path d="M20 12V7a2 2 0 0 0-2-2h-5l-9 9 7 7 9-9z" />
    <circle cx="15" cy="9" r="1.5" />
  </svg>
);

export default TagIcon;