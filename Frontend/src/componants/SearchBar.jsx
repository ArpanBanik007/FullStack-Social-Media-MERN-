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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        dispatch(closeSearch());
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const handleChange = (e) => dispatch(setQuery(e.target.value));
  const handleClear  = () => dispatch(closeSearch());
  const handleKeyDown = (e) => { if (e.key === "Escape") dispatch(closeSearch()); };

  return (
    <>
      <style>{`
        .pluto-search-wrap {
          position: relative;
          width: 100%;
        }

        .pluto-search-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px 8px 14px;
          background: var(--pluto-bg-input);
          border: 1px solid var(--pluto-border);
          border-radius: 9999px;
          transition: border-color 0.2s ease;
        }
        .pluto-search-inner:focus-within {
          border-color: rgba(34, 211, 238, 0.4);
        }

        .pluto-search-icon {
          font-size: 16px;
          color: var(--pluto-text-hint);
          flex-shrink: 0;
          display: flex;
        }
        .pluto-search-inner:focus-within .pluto-search-icon {
          color: var(--pluto-accent);
        }

        .pluto-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--pluto-text-primary);
          font-family: inherit;
          min-width: 0;
        }
        .pluto-search-input::placeholder { color: var(--pluto-text-hint); }

        .pluto-search-clear {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: var(--pluto-text-hint);
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          flex-shrink: 0;
          transition: color 0.15s ease;
        }
        .pluto-search-clear:hover { color: var(--pluto-text-secondary); }
      `}</style>

      <div ref={searchRef} className="pluto-search-wrap">
        <div className="pluto-search-inner">
          <span className="pluto-search-icon"><FiSearch /></span>

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pluto-search-input"
          />

          {query && (
            <button onClick={handleClear} className="pluto-search-clear">
              <FiX />
            </button>
          )}
        </div>

        {isOpen && <SearchDropdown />}
      </div>
    </>
  );
}

export default SearchBar;
