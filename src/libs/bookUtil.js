// libs/bookUtil.js

/**
 * SupabaseからRPC関数を呼び出してデータを取得し、Webページに表示する関数
 * この関数はログイン成功時と、認証状態が変更された時に auth.js から呼び出されます
 *
 * @param {object} supabase - Supabaseクライアントインスタンス
 * @param {HTMLElement} contentAreaDivElement - 書籍リストを表示するDOM要素
 * @param {number} currentPage - 現在のページ番号 (1から始まる)
 * @param {number} itemsPerPage - 1ページあたりの表示項目数
 * @param {function(number): void} totalCountCallback - 総書籍数をmain.jsに伝えるためのコールバック関数
 */
export async function getJoinedBooksData(
  supabase,
  contentAreaDivElement,
  currentPage,
  itemsPerPage,
  totalCountCallback
) {
  try {
    // ページネーションのためのデータ範囲を計算
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;

    // まず書籍の総数を取得する
    // RLSポリシーに注意し、適切に設定されていることを確認してください
    const { count: totalCount, error: countError } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true }); // head:trueでデータは取得せずカウントのみ

    if (countError) {
      console.error(
        "書籍総数の取得中にエラーが発生しました:",
        countError.message
      );
      throw countError;
    }

    // 総数をコールバックでmain.jsに伝える
    if (totalCountCallback) {
      totalCountCallback(totalCount);
    }

    // RPC関数が全件を返した場合、JavaScriptでページングを適用するための呼び出し
    // 理想的にはRPC関数自体にOFFSETとLIMITの引数を渡すように変更することを推奨します
    const { data: allBooks, error: rpcError } = await supabase.rpc(
      "get_books_with_aggregated_authors"
    );

    if (rpcError) {
      console.error(`RPC呼び出し中にエラーが発生しました: ${rpcError.message}`);
      throw rpcError;
    }

    // JavaScriptでページングを適用
    const books = allBooks.slice(startIndex, endIndex + 1);

    // contentAreaDivElement が正しく渡されていることを確認
    if (!contentAreaDivElement) {
      console.error(
        "#content-area element not found. It was not passed correctly."
      );
      return;
    }

    // #books-list 要素への参照を直接取得 (main.jsで既に作成されている前提)
    const booksList = document.getElementById("books-list");
    if (!booksList) {
      console.error("#books-list element not found in #content-area.");
      return;
    }

    // 既存の内容をクリア（innerHTMLを直接空にする方法）
    booksList.innerHTML = "";

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
        const bookFormat = book.book_format || "不明"; // 'format_name' から 'book_format' に修正
        const releaseDate = book.release_date || "不明";
        const purchaseDate = book.purchase_date || "不明";
        const bookCoverImageName = book.book_cover_image_name || "";

        const bookItemDiv = document.createElement("div");
        bookItemDiv.classList.add("book-item");

        // --- 左側：表紙画像コンテナ ---
        const bookCoverDiv = document.createElement("div");
        bookCoverDiv.classList.add("book-cover");

        const bookCoverImg = document.createElement("img");
        if (bookCoverImageName) {
          const { data: coverImageData } = supabase.storage
            .from("bookcovers") // バケット名
            .getPublicUrl(bookCoverImageName); // ファイルパス
          bookCoverImg.src = coverImageData
            ? coverImageData.publicUrl
            : "https://via.placeholder.com/150x225?text=No+Image";
        } else {
          bookCoverImg.src =
            "https://via.placeholder.com/150x225?text=No+Image"; // 画像がない場合の代替
        }
        bookCoverImg.alt = "本の表紙";

        bookCoverDiv.appendChild(bookCoverImg);

        // --- 右側：本の情報コンテナ ---
        const bookInfoDiv = document.createElement("div");
        bookInfoDiv.classList.add("book-info");

        const titleElement = document.createElement("h3");
        titleElement.textContent = bookName;

        bookInfoDiv.appendChild(titleElement);

        const createParagraph = (labelText, value) => {
          // 値が存在し、かつ "不明" や "N/A" ではない場合にのみp要素を生成
          if (value && value !== "不明" && value !== "N/A") {
            const p = document.createElement("p");
            p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
            return p;
          }
          return null; // 要素を生成しない場合はnullを返す
        };

        // createParagraph が null を返す可能性があるので、null チェックを追加
        let pElement = createParagraph("著者", authorNames);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("監修者", supervisorNames);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("翻訳者", translatorNames);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("監訳者", translationSupervisionNames);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("編集者", editorNames);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("出版社", publisherName);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("定価", `¥${price}`);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("ISBN", isbn);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("判型", bookFormat);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("頁数", `${bookPages}ページ`);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("発売日", releaseDate);
        if (pElement) bookInfoDiv.appendChild(pElement);

        pElement = createParagraph("購入日", purchaseDate);
        if (pElement) bookInfoDiv.appendChild(pElement);

        // descriptionがある場合は追加
        if (book.description) {
          const descriptionP = document.createElement("p");
          descriptionP.textContent = book.description;
          descriptionP.classList.add("description"); // CSSでスタイルを適用するためにクラスを追加
          bookInfoDiv.appendChild(descriptionP);
        }

        bookItemDiv.appendChild(bookCoverDiv);
        bookItemDiv.appendChild(bookInfoDiv);

        booksList.appendChild(bookItemDiv);
      });
    } else {
      booksList.innerHTML =
        "<p style='text-align: center; color: #888;'>該当する書籍が見つかりませんでした。</p>";
    }
  } catch (error) {
    console.error("書籍データの取得中にエラーが発生しました:", error.message);
    if (contentAreaDivElement) {
      contentAreaDivElement.innerHTML = `
                <h2>エラー</h2>
                <p>書籍データの読み込みに失敗しました。Supabaseの設定、RLSポリシー、およびテーブル関係を確認してください。</p>
                <p id="error-message">エラー詳細: ${error.message}</p>
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
