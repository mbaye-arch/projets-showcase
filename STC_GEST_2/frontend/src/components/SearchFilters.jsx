function SearchFilters({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className="card">
      <input
        className="input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

export default SearchFilters;
