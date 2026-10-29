import { useSearchParams } from "react-router-dom";

type FilterOption = {
  value: string;
  label: string;
};

type Filter = {
  key: string;
  label: string;
  type: "checkbox" | "radio" | "color" | "range";
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
};

// backendidan

type CategoryFiltersProps = {
  filters?: Filter[];
};
const filterLabels: Record<string, string> = {
  brand: "Brand",
  price: "Price",
  cpu: "Processor",
  ram: "RAM",
  storage: "Storage",
  screen: "Screen",
};
// gadatargmna
function CategoryFilters({ filters }: CategoryFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function toggleCheckbox(filterKey: string, value: string) {
    const params = new URLSearchParams(searchParams);

    const currentValues =
      params.get(filterKey)?.split(",").filter(Boolean) ?? [];

    if (currentValues.includes(value)) {
      const newValues = currentValues.filter(
        (currentValue) => currentValue !== value,
      );

      if (newValues.length > 0) {
        params.set(filterKey, newValues.join(","));
      } else {
        params.delete(filterKey);
      }
    } else {
      currentValues.push(value);

      params.set(filterKey, currentValues.join(","));
    }

    params.set("page", "1");

    setSearchParams(params);
  }

  function selectRadio(filterKey: string, value: string) {
    const params = new URLSearchParams(searchParams);

    params.set(filterKey, value);
    params.set("page", "1");

    setSearchParams(params);
  }

  function changeMinPrice(value: string, min: number, max: number) {
    const params = new URLSearchParams(searchParams);

    const currentMax = Number(params.get("maxPrice") ?? max);
    const newValue = Math.min(Number(value), currentMax);

    if (newValue === min) {
      params.delete("minPrice");
    } else {
      params.set("minPrice", String(newValue));
    }

    params.set("page", "1");

    setSearchParams(params);
  }

  function changeMaxPrice(value: string, min: number, max: number) {
    const params = new URLSearchParams(searchParams);

    const currentMin = Number(params.get("minPrice") ?? min);
    const newValue = Math.max(Number(value), currentMin);

    if (newValue === max) {
      params.delete("maxPrice");
    } else {
      params.set("maxPrice", String(newValue));
    }

    params.set("page", "1");

    setSearchParams(params);
  }

  return (
    <aside>
      {filters?.map((filter) => (
        <section key={filter.key}>
          <h2>{filterLabels[filter.key] ?? filter.label}</h2>
          {/* cvlis qartulidan */}

          {filter.type === "checkbox" &&
            filter.options?.map((option) => {
              const selectedValues =
                searchParams.get(filter.key)?.split(",").filter(Boolean) ?? [];

              const checked = selectedValues.includes(option.value);

              return (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={checked}
                    onChange={() => toggleCheckbox(filter.key, option.value)}
                  />

                  {option.label}
                </label>
              );
            })}

          {filter.type === "radio" &&
            filter.options?.map((option) => {
              const selectedValue = searchParams.get(filter.key);

              return (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={filter.key}
                    value={option.value}
                    checked={selectedValue === option.value}
                    onChange={() => selectRadio(filter.key, option.value)}
                  />

                  {option.label}
                </label>
              );
            })}

          {filter.type === "color" &&
            filter.options?.map((option) => {
              const selectedValue = searchParams.get(filter.key);

              return (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={filter.key}
                    value={option.value}
                    checked={selectedValue === option.value}
                    onChange={() => selectRadio(filter.key, option.value)}
                  />

                  {option.label}
                </label>
              );
            })}

          {filter.type === "range" && (
            <div>
              <div>
                <label>
                  Minimum: {searchParams.get("minPrice") ?? filter.min}
                </label>

                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={Number(searchParams.get("minPrice") ?? filter.min)}
                  onChange={(event) =>
                    changeMinPrice(
                      event.target.value,
                      filter.min ?? 0,
                      filter.max ?? 0,
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Maximum: {searchParams.get("maxPrice") ?? filter.max}
                </label>

                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={Number(searchParams.get("maxPrice") ?? filter.max)}
                  onChange={(event) =>
                    changeMaxPrice(
                      event.target.value,
                      filter.min ?? 0,
                      filter.max ?? 0,
                    )
                  }
                />
              </div>

              <span>
                {filter.min} {filter.unit} - {filter.max} {filter.unit}
              </span>
            </div>
          )}
        </section>
      ))}
    </aside>
  );
}

export default CategoryFilters;
