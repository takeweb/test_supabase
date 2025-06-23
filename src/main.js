// src/main.js

import { initializeAuthUI } from "./auth";
import "./style.css";
import { supabase } from "./supabaseClient";

// --- DOM要素への参照 ---
const appDiv = document.querySelector("#app");
let authFormElement;
let emailInputElement;
let passwordInputElement;
let togglePasswordButtonElement; // パスワード表示切り替えボタンを追加
let signInButtonElement;
let signUpButtonElement;
let signOutButtonElement;
let userInfoDivElement;
let contentAreaDivElement;

/**
 * アプリケーションの初期UIをレンダリングする関数
 */
function renderInitialUI() {
  if (!appDiv) {
    console.error("#app element not found in index.html");
    return;
  }

  appDiv.innerHTML = `
    <div id="auth-container">
      <h1>Supabase 書籍リスト</h1>
      <div id="auth-status-area" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div id="user-info"></div>
        <button type="button" id="sign-out-btn" style="padding: 8px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; display: none; margin-left: 10px;">ログアウト</button>
      </div>

      <form id="auth-form" style="display: flex; flex-direction: column; max-width: 300px; gap: 10px; margin-bottom: 20px;">
        <input type="email" id="email" placeholder="メールアドレス" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <div class="password-input-container">
          <input type="password" id="password" placeholder="パスワード" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <button type="button" id="toggle-password-btn">👁️</button>
        </div>
        <button type="submit" id="sign-in-btn" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">ログイン</button>
        <button type="button" id="sign-up-btn" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">サインアップ</button>
      </form>

      <div id="content-area"></div>
    </div>
  `;

  // UI要素への参照を取得
  authFormElement = document.getElementById("auth-form");
  emailInputElement = document.getElementById("email");
  passwordInputElement = document.getElementById("password");
  togglePasswordButtonElement = document.getElementById("toggle-password-btn");
  signInButtonElement = document.getElementById("sign-in-btn");
  signUpButtonElement = document.getElementById("sign-up-btn");
  signOutButtonElement = document.getElementById("sign-out-btn");
  userInfoDivElement = document.getElementById("user-info");
  contentAreaDivElement = document.getElementById("content-area");

  // パスワード表示切り替えボタンのイベントリスナー
  if (togglePasswordButtonElement) {
    togglePasswordButtonElement.addEventListener("click", () => {
      if (passwordInputElement.type === "password") {
        passwordInputElement.type = "text";
        togglePasswordButtonElement.textContent = "🔒"; // ロックアイコンに変更
      } else {
        passwordInputElement.type = "password";
        togglePasswordButtonElement.textContent = "👁️"; // 目玉アイコンに戻す
      }
    });
  }

  // auth.js の初期化関数を呼び出し、要素とコールバックを渡す
  initializeAuthUI(
    {
      authFormElement,
      emailInputElement,
      passwordInputElement,
      signInButtonElement,
      signUpButtonElement,
      signOutButtonElement,
      userInfoDivElement,
      contentAreaDivElement,
    },
    getJoinedBooksData
  );
}

/**
 * SupabaseからRPC関数を呼び出してデータを取得し、Webページに表示する関数
 * この関数はログイン成功時と、認証状態が変更された時に auth.js から呼び出されます
 * @param {object} session - ログイン中のユーザーセッションオブジェクト
 */
async function getJoinedBooksData(session) {
  console.log(`session.user.id: ${session.user.id}`);
  try {
    const { data: books, error } = await supabase.rpc(
      "get_books_with_aggregated_authors"
    );

    if (error) {
      console.log(`error: ${error}`);
      throw error;
    }

    if (!contentAreaDivElement) {
      console.error("#content-area element not found.");
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
        const authorNames = book.author_names || "不明";
        const supervisorNames = book.supervisor_names || "";
        const translatorNames = book.translator_names || "";
        const translationSupervisionNames =
          book.translation_supervision_names || "";
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
          console.log(`coverImageUrl: ${coverImageUrl}`);
          bookDetails.push(
            `<img src="${coverImageUrl}" alt="本の表紙" style="max-width: 150px; height: auto; margin-bottom: 10px;">`
          );
        }

        bookDetails.push(`<strong>著者:</strong> ${authorNames}`);
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

        bookDetails.push(`<strong>出版社:</strong> ${publisherName}`);
        bookDetails.push(`<strong>価格:</strong> ¥${price}`);
        bookDetails.push(`<strong>ISBN:</strong> ${isbn}`);
        bookDetails.push(`<strong>形式:</strong> ${bookFormat}`);
        bookDetails.push(`<strong>本の長さ:</strong> ${bookPages}ページ`);
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

function formatIsbn(isbn) {
  if (isbn && isbn.startsWith("978-") && isbn.length === 14) {
    const numbersPart = isbn.substring(4);
    if (numbersPart.length === 10) {
      isbn = `978-${numbersPart.substring(0, 1)}-${numbersPart.substring(
        1,
        4
      )}-${numbersPart.substring(4, 9)}-${numbersPart.substring(9, 10)}`;
    } else {
      isbn = "N/A (不正なISBN形式)";
    }
  } else if (isbn && isbn.startsWith("979-") && isbn.length === 14) {
    const numbersPart = isbn.substring(4);
    if (numbersPart.length === 10) {
      isbn = `979-${numbersPart.substring(0, 1)}-${numbersPart.substring(
        1,
        4
      )}-${numbersPart.substring(4, 9)}-${numbersPart.substring(9, 10)}`;
    } else {
      isbn = "N/A (不正なISBN形式)";
    }
  } else {
    isbn = "N/A";
  }
  return isbn;
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", renderInitialUI);
