// libs/bookUtil.js (修正後)

// import { supabase } from "./supabaseClient"; // supabaseClientは引数で受け取るので不要

/**
 * SupabaseからRPC関数を呼び出してデータを取得し、Webページに表示する関数
 * この関数はログイン成功時と、認証状態が変更された時に auth.js から呼び出されます
 * @param {object} supabase - Supabaseクライアントインスタンス
 * @param {HTMLElement} contentAreaDivElement - 書籍リストを表示するDOM要素
 */
export async function getJoinedBooksData(supabase, contentAreaDivElement) {
  try {
    const { data: books, error } = await supabase.rpc(
      "get_books_with_aggregated_authors"
    );

    if (error) {
      console.log(`error: ${error}`);
      throw error;
    }

    // contentAreaDivElement が正しく渡されていることを確認
    if (!contentAreaDivElement) {
      console.error(
        "#content-area element not found. It was not passed correctly."
      );
      return;
    }

    contentAreaDivElement.innerHTML = `<ul id="books-list"></ul>`;

    const booksList = document.getElementById("books-list");

    if (books && books.length > 0) {
      books.forEach((book) => {
        const title = book.title;
        const subtitle = book.sub_title;
        const edition = book.edition;
        const bookName = `${title}${edition ? `  ${edition}` : ""}${
          subtitle ? `  ―${subtitle}` : ""
        }`;
        const bookPages = book.pages;
        const authorNames = book.author_names || "";
        const supervisorNames = book.supervisor_names || "";
        const translatorNames = book.translator_names || "";
        const translationSupervisionNames =
          book.translation_supervision_names || "";
        const editorNames = book.editor_names || "";
        const publisherName = book.publisher_name || "不明";
        const price = Number(book.price).toLocaleString("ja-JP");
        const isbn = formatIsbn(book.isbn);
        const bookFormat = book.format_name || "不明";
        const releaseDate = book.release_date || "不明";
        const purchaseDate = book.purchase_date || "不明";
        const bookCoverImageName = book.book_cover_image_name || "";

        const listItem = document.createElement("li");

        const bookDetails = [];
        bookDetails.push(`<strong>書籍名:</strong> ${bookName}`);

        if (bookCoverImageName) {
          // bookcoversバケット内の指定された画像の公開URLを取得
          const { data: coverImageData } = supabase.storage
            .from("bookcovers") // バケット名
            .getPublicUrl(bookCoverImageName); // ファイルパス

          const coverImageUrl = coverImageData ? coverImageData.publicUrl : "";
          // console.log(`coverImageUrl: ${coverImageUrl}`);
          bookDetails.push(
            `<img src="${coverImageUrl}" alt="本の表紙" style="max-width: 150px; height: auto; margin-bottom: 10px;">`
          );
        }

        if (authorNames) {
          bookDetails.push(`<strong>著者:</strong> ${authorNames}`);
        }
        if (supervisorNames) {
          bookDetails.push(`<strong>監修者:</strong> ${supervisorNames}`);
        }
        if (translatorNames) {
          bookDetails.push(`<strong>翻訳者:</strong> ${translatorNames}`);
        }
        if (translationSupervisionNames) {
          bookDetails.push(
            `<strong>監訳者:</strong> ${translationSupervisionNames}`
          );
        }
        if (editorNames) {
          bookDetails.push(`<strong>編集者:</strong> ${editorNames}`);
        }

        bookDetails.push(`<strong>出版社:</strong> ${publisherName}`);
        bookDetails.push(`<strong>定価:</strong> ¥${price}`);
        bookDetails.push(`<strong>ISBN:</strong> ${isbn}`);
        bookDetails.push(`<strong>判型:</strong> ${bookFormat}`);
        bookDetails.push(`<strong>頁数:</strong> ${bookPages}ページ`);
        bookDetails.push(`<strong>発売日:</strong> ${releaseDate}`);
        bookDetails.push(`<strong>購入日:</strong> ${purchaseDate}`);

        listItem.innerHTML = bookDetails.join("<br>");
        booksList.appendChild(listItem);
      });
    } else {
      booksList.innerHTML = "<li>該当する書籍が見つかりませんでした。</li>";
    }
  } catch (error) {
    console.error("書籍データの取得中にエラーが発生しました:", error.message);
    if (contentAreaDivElement) {
      contentAreaDivElement.innerHTML = `
                <h2>エラー</h2>
                <p>書籍データの読み込みに失敗しました。Supabaseの設定、RLSポリシー、およびテーブル関係を確認してください。</p>
                <p id="error-message" style="color: red;">エラー詳細: ${error.message}</p>
            `;
    }
  }
}

export function formatIsbn(isbn) {
  if (!isbn) {
    return "N/A"; // ISBNがnullishの場合は 'N/A' を返す
  }

  // 入力されたISBNから数字以外の文字を全て除去
  const cleanedIsbn = isbn.replace(/[^0-9]/g, "");

  // 13桁のISBN-13形式を想定
  if (cleanedIsbn.length === 13) {
    const prefix = cleanedIsbn.substring(0, 3); // 978 または 979
    const registrationGroup = cleanedIsbn.substring(3, 4); // 国または言語圏の識別子
    const registrant = cleanedIsbn.substring(4, 9); // 出版社などの識別子
    const publication = cleanedIsbn.substring(9, 12); // 書籍自体の識別子
    const checkDigit = cleanedIsbn.substring(12, 13); // チェックディジット

    // ISBN-13の標準的なハイフン区切りに整形
    // 例: 978-4-7981-7723-6
    return `${prefix}-${registrationGroup}-${registrant}-${publication}-${checkDigit}`;
  } else {
    // 13桁以外のISBNは不正な形式として扱う
    return "N/A (不正なISBN形式)";
  }
}
