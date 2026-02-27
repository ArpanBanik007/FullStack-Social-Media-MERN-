const Button = ({
  text,
  onClick,
  disabled,
  type = "button",
  loading = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full text-white font-bold py-2 px-4 rounded-lg transition 
        ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-amber-800 hover:bg-amber-400"
        } 
        ${className}`}
    >
      {loading ? "Processing..." : text}
    </button>
  );
};

export default Button;
