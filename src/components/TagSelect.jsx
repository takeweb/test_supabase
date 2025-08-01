
function TagSelect({ tags, selectedTag, setSelectedTag, setCurrentPage }) {
  return (
    <div className="w-full max-w-sm mx-auto mb-4 flex flex-row items-center justify-center gap-2">
      <label htmlFor="tag-select" className="text-gray-700 font-semibold whitespace-nowrap">タグで絞り込み：</label>
      <select
        id="tag-select"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 shadow-sm min-w-[120px]"
        value={selectedTag}
        onChange={e => {
          setSelectedTag(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="">すべて</option>
        {tags.map(tag => (
          <option key={tag.id} value={tag.id}>
            {tag.tag_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TagSelect;
