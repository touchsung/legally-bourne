"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Step 1 Select Country
      </h2>
      <Select value={selectedCountry} onValueChange={onCountryChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your country" />
        </SelectTrigger>
        <SelectContent>
          {(countries as Country[]).map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
