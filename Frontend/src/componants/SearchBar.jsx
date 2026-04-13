import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSearchResults,
  setQuery,
  closeSearch,
  clearResults,
  selectSearchQuery,
  selectSearchIsOpen,
} from "../slices/Search.slice";
import { useDebounce } from "../hooks/Usedebounce";
import SearchDropdown from "./Searchdropdown";
import { FiSearch, FiX } from "react-icons/fi";

function SearchBar({ placeholder = "Search people, posts, videos..." }) {
  const dispatch = useDispatch();
  const query = useSelector(selectSearchQuery);
  const isOpen = useSelector(selectSearchIsOpen);
  const searchRef = useRef(null);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(fetchSearchResults(debouncedQuery.trim()));
    } else {
      dispatch(clearResults());
    }
  }, [debouncedQuery, dispatch]);

  // ── Click outside হলে dropdown বন্ধ করো ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        dispatch(closeSearch());
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  // ── Input change ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    dispatch(setQuery(e.target.value));
  };

  // ── Clear button ─────────────────────────────────────────────────────────
  const handleClear = () => {
    dispatch(closeSearch());
  };

  // ── Escape key ───────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Escape") dispatch(closeSearch());
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* ── Input Wrapper ── */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
          isOpen
            ? "bg-gray-800 border-blue-500/50 shadow-lg shadow-blue-500/10"
            : "bg-gray-800/60 border-white/10 hover:border-white/20"
        }`}
      >
        {/* Search Icon */}
        <FiSearch
          className={`flex-shrink-0 text-base transition-colors ${
            isOpen ? "text-blue-400" : "text-gray-500"
          }`}
        />

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search people, posts, videos..."
          className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none min-w-0"
        />

        {/* Clear Button — query থাকলে দেখাবে */}
        {query && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <FiX className="text-base" />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {isOpen && <SearchDropdown />}
    </div>
  );
}

export default SearchBar;
