const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 px-3 text-sm border-2 border-gray-100 rounded-xl text-slate-50
                 focus:outline-none 
                 hover:border-gray-400 
                 focus:border-slate-300 focus:ring-2 focus:ring-slate-700"
    />
  );
};

export default SearchBar;
