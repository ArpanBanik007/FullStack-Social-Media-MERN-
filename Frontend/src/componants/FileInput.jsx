const FileInput = ({ placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 px-3 text-sm border-2 border-gray-800 rounded-xl text-slate-700
                 focus:outline-none 
                 hover:border-gray-600 
                 focus:border-slate-400 focus:ring-2 focus:ring-slate-700"
    />
  );
};

export default FileInput;
