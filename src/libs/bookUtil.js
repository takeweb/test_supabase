/**
 * 表紙画像URLをSupabase Storageから取得
 * @param {object} supabaseClient - Supabaseクライアント
 * @param {string|null|undefined} bookCoverImageName - 画像ファイル名
 * @returns {string} 表紙画像のURL
 */
export function getBookCoverUrl(supabaseClient, bookCoverImageName) {
  const noImageUrl = "https://placehold.jp/150x225.png?text=No+Image";
  if (!bookCoverImageName) {
    return noImageUrl;
  }
  const { data: coverImageData } = supabaseClient.storage
    .from("bookcovers")
    .getPublicUrl(bookCoverImageName);
  if (coverImageData && coverImageData.publicUrl) {
    return coverImageData.publicUrl;
  }
  return noImageUrl;
}
// libs/bookUtil.js

/**
 * SupabaseからRPC関数を呼び出してデータを取得し、Webページに表示する関数
 * この関数はログイン成功時と、認証状態が変更された時に auth.js から呼び出されます
 * @param {object} supabaseClient - Supabaseクライアントインスタンス
 * @param {number} currentPage - 現在のページ番号 (1から始まる)
 * @param {number} itemsPerPage - 1ページあたりの表示項目数
 * @param {function(number): void} totalCountCallback - 総書籍数をmain.jsに伝えるためのコールバック関数
 * @param {string|undefined|null} tagId - 選択されたタグID（省略可）
 */
export async function getJoinedBooksData(
  supabaseClient,
  currentPage,
  itemsPerPage,
  totalCountCallback,
  tagId = null
) {
  try {
    // ページネーションのためのデータ範囲を計算
    const offset = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      if (totalCountCallback) totalCountCallback(0);
      return [];
    }
    const userId = user.id;

    // 総件数取得はgetTotalCount関数を利用（userIdを渡す）
    let totalCount = 0;
    try {
      totalCount = await getTotalCount(supabaseClient, userId, tagId);
      if (totalCountCallback) totalCountCallback(totalCount);
    } catch (countError) {
      if (totalCountCallback) totalCountCallback(0);
      throw countError;
    }

    // RPCで書籍データ取得
    const rpcParams = { p_offset: offset, p_limit: limit };
    if (tagId && tagId !== "") rpcParams.p_tag = tagId;
    const { data: books, error: rpcError } = await supabaseClient.rpc(
      "get_books_with_aggregated_authors",
      rpcParams
    );
    if (rpcError) throw rpcError;
    // React用：データ配列のみ返す
    return books || [];
  } catch (error) {
    console.error("書籍データの取得中にエラーが発生しました:", error.message);
    if (totalCountCallback) totalCountCallback(0);
    return [];
  }
}

/**
 * 件数取得
 * @param {object} supabaseClient - Supabaseクライアントインスタンス
 * @param {number} userId - ログインユーザID
 * @param {number} tagId - 選択されたタグのID（省略可）
 * @returns 件数
 */
export async function getTotalCount(supabaseClient, userId, tagId = null) {
  if (tagId == null) {
    // タグ指定なし→全件
    const { data, error, count } = await supabaseClient
      .from("user_books")
      .select("book_id", { count: "exact", head: true })
      .eq("user_id", userId);
    return count || 0;
  } else {
    // タグ指定あり→タグで絞り込み
    const { data, error, count } = await supabaseClient
      .from("user_books")
      .select("book_id", { count: "exact", head: true })
      .in(
        "book_id",
        (
          await supabaseClient
            .from("book_tags")
            .select("book_id")
            .eq("tag_id", tagId)
        ).data?.map((row) => row.book_id) || []
      )
      .eq("user_id", userId);
    return count || 0;
  }
}

/**
 * タグのリストを取得する関数
 * @param {object} supabaseClient - Supabaseクライアントインスタンス
 * @returns tagのリスト
 * @returns {Promise<Array>} タグのリスト
 */
export async function getTagSelectData(supabaseClient) {
  const { data, error } = await supabaseClient
    .from("tags")
    .select("id, tag_name")
    .order("id");
  if (error) {
    console.error("タグ取得エラー:", error);
    return;
  }
  return data || [];
}

/**
 * 入力文字列をISBNフォーマットに変換
 * @param {string} isbn 入力文字列
 * @returns ISBNフォーマット変換済み文字列
 */
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
