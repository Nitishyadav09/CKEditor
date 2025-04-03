
const CircularProgress = ({size}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="60"
        strokeDashoffset="20"
        style={{
          animation: 'spin 1s linear infinite',
          transformOrigin: 'center'
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
};

export default CircularProgress;
