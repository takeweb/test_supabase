import { getBookCoverUrl } from "../libs/bookUtil";
import { supabase } from "../libs/supabaseClient";
import { useEffect } from "react";

function BookList({ books, pagination, onBookClick, onUpdate }) {
  useEffect(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[56px] w-full">
        <p style={{ color: "#888" }} className="text-lg">
          該当する書籍が見つかりませんでした。
        </p>
      </div>
    );
  }

  const formatBookTitle = (book) => {
    const title = book.title || "";
    const subtitle = book.sub_title || "";
    const edition = book.edition || "";
    const label_name = book.label_name;
    const classification_code = book.classification_code;

    return `${title}${edition ? ` ${edition}` : ""}${
      subtitle ? `  ―${subtitle}` : ""
    }${classification_code ? ` (${label_name} ${classification_code})` : ""}`;
  };

  return (
    <div className="book-list">
      {books.map((book) => {
        return (
          <div
            key={book.id}
            className="book-item cursor-pointer"
            onClick={() => {
              console.log("BookListでクリックされたbook:", book);
              onBookClick(book);
            }}
          >
            <div className="book-cover">
              <img
                src={getBookCoverUrl(supabase, book.book_cover_image_name)}
                alt="本の表紙"
                className="book-cover-img"
              />
            </div>
            <div className="book-detail">
              <div className="book-title">{formatBookTitle(book)}</div>
              <div>著者: {book.author_names || "-"}</div>
              {book.translator_names && (
                <div>翻訳者: {book.translator_names || "-"}</div>
              )}
              {book.illustrator_names && (
                <div>イラスト: {book.illustrator_names || "-"}</div>
              )}
              <div>出版社: {book.publisher_name || "-"}</div>
              <div>
                定価: {book.price ? `¥${book.price.toLocaleString()}` : "-"}
              </div>
              <div>ISBN-10: {book.isbn_10 || "-"}</div>
              <div>ISBN-13: {book.isbn || "-"}</div>
              <div>判型: {book.format_name || "-"}</div>
              <div>頁数: {book.pages ? `${book.pages}ページ` : "-"}</div>
              <div>発売日: {book.release_date || "-"}</div>
              {book.purchase_date && <div>購入日: {book.purchase_date}</div>}
              {book.read_end_date && <div>読了日: {book.read_end_date}</div>}
            </div>
          </div>
        );
      })}
      {/* ページネーションを枠内下部に表示（上マージン追加） */}
      <div className="mt-6 mb-6">{pagination}</div>
    </div>
  );
}

export default BookList;
