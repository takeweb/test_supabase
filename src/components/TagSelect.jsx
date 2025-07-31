
function TagSelect({ tags, selectedTag, setSelectedTag, setCurrentPage }) {
  return (
    <div className="tag-select-area">
      <label htmlFor="tag-select">タグで絞り込み：</label>
      <select
        id="tag-select"
        className="tag-select"
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
