// src/main.js

import { initializeAuthUI } from "./libs/auth";
import { getJoinedBooksData } from "./libs/bookUtil";
import "./style.css";

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

// --- ページネーション関連のDOM要素 ---
let paginationContainerElement;
let firstPageButtonElement; // 最初のページへボタン
let prevPageButtonElement;
let nextPageButtonElement;
let lastPageButtonElement; // 最後のページへボタン
let pageInfoElement;

// --- ページネーションの状態 ---
let currentPage = 1; // 現在のページ
const itemsPerPage = 5; // 1ページあたりの表示項目数
let totalBooksCount = 0; // 全書籍数

/**
 * ページネーションUIを更新する関数
 */
function updatePaginationUI() {
  const totalPages = Math.ceil(totalBooksCount / itemsPerPage);
  pageInfoElement.textContent = `${currentPage} / ${totalPages} ページ`;

  // 最初のページへボタンの有効/無効を切り替え
  if (firstPageButtonElement) {
    firstPageButtonElement.disabled = currentPage === 1;
  }
  // 前へボタンの有効/無効を切り替え
  if (prevPageButtonElement) {
    prevPageButtonElement.disabled = currentPage === 1;
  }
  // 次へボタンの有効/無効を切り替え
  if (nextPageButtonElement) {
    nextPageButtonElement.disabled =
      currentPage === totalPages || totalPages === 0;
  }
  // 最後のページへボタンの有効/無効を切り替え
  if (lastPageButtonElement) {
    lastPageButtonElement.disabled =
      currentPage === totalPages || totalPages === 0;
  }
}

/**
 * 書籍データを再ロードするヘルパー関数
 */
async function loadBooksForPage() {
  // async キーワードを追加
  if (window.supabaseClient) {
    await getJoinedBooksData(
      // await を追加してデータ取得を待つ
      window.supabaseClient,
      contentAreaDivElement,
      currentPage,
      itemsPerPage,
      (count) => {
        totalBooksCount = count;
        updatePaginationUI();
      }
    );
    // ★ここから追加★ ページトップへスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
    // ★ここまで追加★
  } else {
    console.error("Supabase client is not available for pagination.");
  }
}

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
      <div id="auth-status-area">
        <div id="user-info"></div>
        <button type="button" id="sign-out-btn">ログアウト</button>
      </div>

      <form id="auth-form">
        <input type="email" id="email" placeholder="メールアドレス" required>
        <div class="password-input-container">
          <input type="password" id="password" placeholder="パスワード" required>
          <button type="button" id="toggle-password-btn">👁️</button>
        </div>
        <button type="submit" id="sign-in-btn">ログイン</button>
        <button type="button" id="sign-up-btn">サインアップ</button>
      </form>

      <div id="content-area">
        <!-- 書籍情報が表示されるコンテナを事前に作成 -->
        <div id="books-list"></div>
      </div>

      <div id="pagination-container">
        <button type="button" id="first-page-btn" class="pagination-btn">最初へ</button>
        <button type="button" id="prev-page-btn" class="pagination-btn">前へ</button>
        <span id="page-info">1 / 1 ページ</span>
        <button type="button" id="next-page-btn" class="pagination-btn">次へ</button>
        <button type="button" id="last-page-btn" class="pagination-btn">最後へ</button>
      </div>
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
  contentAreaDivElement = document.getElementById("content-area"); // #content-areaを取得

  // ページネーション要素への参照を取得
  paginationContainerElement = document.getElementById("pagination-container");
  firstPageButtonElement = document.getElementById("first-page-btn");
  prevPageButtonElement = document.getElementById("prev-page-btn");
  nextPageButtonElement = document.getElementById("next-page-btn");
  lastPageButtonElement = document.getElementById("last-page-btn");
  pageInfoElement = document.getElementById("page-info");

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

  // ページネーションボタンのイベントリスナー
  if (firstPageButtonElement) {
    firstPageButtonElement.addEventListener("click", () => {
      if (currentPage !== 1) {
        currentPage = 1;
        loadBooksForPage();
      }
    });
  }

  if (prevPageButtonElement) {
    prevPageButtonElement.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadBooksForPage();
      }
    });
  }

  if (nextPageButtonElement) {
    nextPageButtonElement.addEventListener("click", () => {
      const totalPages = Math.ceil(totalBooksCount / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        loadBooksForPage();
      }
    });
  }

  if (lastPageButtonElement) {
    lastPageButtonElement.addEventListener("click", () => {
      const totalPages = Math.ceil(totalBooksCount / itemsPerPage);
      if (currentPage !== totalPages && totalPages > 0) {
        currentPage = totalPages;
        loadBooksForPage();
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
      paginationContainerElement, // ページネーションコンテナも渡す
    },
    // ここで getJoinedBooksData を直接呼び出すように変更
    async (supabaseInstance, contentArea) => {
      // Supabaseクライアントインスタンスをグローバルに保持（一時的対応）
      window.supabaseClient = supabaseInstance;

      // ページネーション状態をリセットして最初のページをロード
      currentPage = 1;
      await loadBooksForPage(); // ヘルパー関数を呼び出す
    }
  );
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", renderInitialUI);
