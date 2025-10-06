import React, { useState, useEffect } from "react";
import { supabase } from "../libs/supabaseClient";
import { getBookCoverUrl } from "../libs/bookUtil";

const BookDetailModal = ({ book, onClose, onUpdate }) => {
  if (!book) return null; // bookがnullの場合は何も表示しない

  const [purchaseDate, setPurchaseDate] = useState(book.purchase_date || ""); // 購入日
  const [readEndDate, setReadEndDate] = useState(book.read_end_date || ""); // 読了日 
  const [tags, setTags] = useState([]); // タグ一覧
  const [selectedTags, setSelectedTags] = useState([]); // 選択されたタグ

  useEffect(() => {
    // タグ一覧を取得
    const fetchTags = async () => {
      const { data, error } = await supabase.from("tags").select("*");
      if (error) {
        console.error("タグの取得に失敗しました:", error);
      } else {
        setTags(data || []);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    // 選択済みのタグを取得してチェックを入れる
    const fetchSelectedTags = async () => {
      if (!book.id) return;
      const { data, error } = await supabase
        .from("book_tags")
        .select("tag_id")
        .eq("book_id", book.id);

      if (error) {
        console.error("選択済みタグの取得に失敗しました:", error);
      } else {
        setSelectedTags(data.map((tag) => tag.tag_id));
      }
    };
    fetchSelectedTags();
  }, [book.id]);

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId) // 解除
        : [...prev, tagId] // 選択
    );
  };

  const handleUpdate = async () => {
    if (!book.user_id || !book.id) {
      console.error("user_idまたはbook_idが未定義です。");
      alert("更新に必要な情報が不足しています。");
      return;
    }

    try {
      // book_tagsを更新
      const { error: deleteError } = await supabase
        .from("book_tags")
        .delete()
        .eq("book_id", book.id);

      if (deleteError) {
        console.error("既存のタグ削除に失敗しました:", deleteError);
        alert("タグの削除に失敗しました。");
        return;
      }

      const { error: insertError } = await supabase.from("book_tags").insert(
        selectedTags.map((tagId) => ({
          book_id: book.id,
          tag_id: tagId,
        }))
      );

      if (insertError) {
        console.error("タグの挿入に失敗しました:", insertError);
        alert("タグの追加に失敗しました。", insertError.message);
        return;
      }

      // purchase_dateを更新
      if (purchaseDate) {
        const { error: updateError } = await supabase
          .from("user_books")
          .update({ purchase_date: purchaseDate })
          .eq("user_id", book.user_id)
          .eq("book_id", book.id);

        if (updateError) {
          console.error("購入日の更新に失敗しました:", updateError);
          alert("購入日の更新に失敗しました。");
          return;
        }
      }

      // read_end_dateを更新
      if (readEndDate) {
        const { error: updateError } = await supabase
          .from("user_books")
          .update({ read_end_date: readEndDate })
          .eq("user_id", book.user_id)
          .eq("book_id", book.id);

        if (updateError) {
          console.error("読了日の更新に失敗しました:", updateError);
          alert("読了日の更新に失敗しました。");
          return;
        }
      }

      alert("更新されました。");

      // 親コンポーネントに更新を通知
      if (onUpdate) {
        onUpdate();
      }

      onClose();
    } catch (err) {
      console.error("予期せぬエラー:", err);
      alert("予期せぬエラーが発生しました。");
    }
  };

  const formatBookTitle = (book) => {
    const title = book.title || "";
    const subtitle = book.sub_title || "";
    const edition = book.edition || "";
    const label_name = book.label_name;
    const classification_code = book.classification_code;

    return `${title}${edition ? ` ${edition}` : ""}${subtitle ? `  ―${subtitle}` : ""}${classification_code ? ` (${label_name} ${classification_code})` : ""}`;
  };

  // console.log("BookDetailModalに渡されたbookオブジェクト:", book); // 追加: bookオブジェクトのデバッグログ

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={getBookCoverUrl(supabase, book.book_cover_image_name)}
            alt="表紙画像"
            className="w-48 h-auto mb-4 rounded" // 表紙画像を大きく
          />
          <h2 className="text-xl font-bold mb-4">{formatBookTitle(book)}</h2>
        </div>
        <p><strong>著者:</strong> {book.author_names || "-"}</p>
        {book.translator_names && (
          <div>翻訳者: {book.translator_names || "-"}</div>
        )}
        <p><strong>出版社:</strong> {book.publisher_name || "-"}</p>
        <p><strong>定価:</strong> {book.price ? `¥${book.price.toLocaleString()}` : "-"}</p>
        <p><strong>ISBN-10:</strong> {book.isbn_10 || "-"}</p>
        <p><strong>ISBN-13:</strong> {book.isbn || "-"}</p>
        <p><strong>判型:</strong> {book.format_name || "-"}</p>
        <p><strong>頁数:</strong> {book.pages ? `${book.pages}ページ` : "-"}</p>
        <p><strong>発売日:</strong> {book.release_date || "-"}</p>
        

        <div className="mt-4 flex items-center">
          <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-700 mr-2">
            <strong>購入日:</strong>
          </label>
          <input
            type="date"
            id="purchase-date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="block w-48 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2" // テキストサイズを統一
          />
        </div>
          <div className="mt-4 flex items-center">
          <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-700 mr-2">
            <strong>読了日:</strong>
          </label>
          <input
            type="date"
            id="read-end-date"
            value={readEndDate}
            onChange={(e) => setReadEndDate(e.target.value)}
            className="block w-48 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2" // テキストサイズを統一
          />
        </div>

        {/* タグ選択UIを追加 */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">タグ:</p>
          <div
            className="flex flex-wrap gap-2 mt-2 overflow-y-auto"
            style={{ maxHeight: "120px" }} // 高さを制限してスクロール可能に
          >
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                  className="mr-2"
                />
                {tag.tag_name}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between"> {/* ボタン間のスペースを調整 */}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleUpdate}
          >
            更新
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
