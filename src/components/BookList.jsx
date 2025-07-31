import { getBookCoverUrl } from "../libs/bookUtil";
import { supabase } from "../libs/supabaseClient";

function BookList({ books }) {
  return (
    <div className="book-list">
      {books.length === 0 ? (
        <p style={{ color: "#888" }}>該当する書籍が見つかりませんでした。</p>
      ) : (
        books.map(book => {
          const title = book.title;
          const subtitle = book.sub_title;
          const edition = book.edition;
          const bookName = `${title}${edition ? `  ${edition}` : ""}${subtitle ? `  ―${subtitle}` : ""}`;
          return (
            <div key={book.id} className="book-item">
              <div className="book-cover">
                <img
                  src={getBookCoverUrl(supabase, book.book_cover_image_name)}
                  alt="本の表紙"
                  className="book-cover-img"
                />
              </div>
              <div className="book-detail">
                <div className="book-title">{bookName}</div>
                <div>著者: {book.author_names || "-"}</div>
                <div>翻訳者: {book.translator_names || "-"}</div>
                <div>出版社: {book.publisher_name || "-"}</div>
                <div>定価: {book.price ? `¥${book.price.toLocaleString()}` : "-"}</div>
                <div>ISBN: {book.isbn || "-"}</div>
                <div>判型: {book.format_name || "-"}</div>
                <div>頁数: {book.pages ? `${book.pages}ページ` : "-"}</div>
                <div>発売日: {book.release_date || "-"}</div>
                <div>購入日: {book.purchase_date || "-"}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default BookList;
