"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import countries from "@/data/countries.json";

interface Country {
  code: string;
  name: string;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export function CountrySelector({
  selectedCountry,
  onCountryChange,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countries as Country[];
    }

    const query = searchQuery.toLowerCase();
    return (countries as Country[]).filter((country) =>
      country.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get selected country name
  const selectedCountryName = useMemo(() => {
    const country = (countries as Country[]).find(
      (c) => c.code === selectedCountry
    );
    return country?.name || "";
  }, [selectedCountry]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (countryCode: string) => {
    onCountryChange(countryCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Step 1: Select Country
      </h2>

      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`
            w-full px-4 py-3 text-left bg-white border rounded-lg
            flex items-center justify-between
            transition-all duration-200
            ${
              isOpen
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-300 hover:border-gray-400"
            }
            ${selectedCountry ? "text-gray-900" : "text-gray-500"}
          `}
        >
          <span>
            {selectedCountryName || "Select your country or jurisdiction"}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Countries List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                <div className="py-1">
                  {filteredCountries.map((country) => {
                    const isSelected = country.code === selectedCountry;
                    return (
                      <button
                        key={country.code}
                        onClick={() => handleSelect(country.code)}
                        className={`
                          w-full px-4 py-2.5 text-left flex items-center justify-between
                          transition-colors duration-150
                          ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-900 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span className="font-medium">{country.name}</span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No countries found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>

            {/* Footer with count */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {searchQuery ? (
                <span>
                  {filteredCountries.length} of {countries.length} countries
                </span>
              ) : (
                <span>{countries.length} countries available</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Country Display */}
      {selectedCountry && (
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-600 mr-2" />
          <span>
            Selected:{" "}
            <strong className="text-gray-900">{selectedCountryName}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
