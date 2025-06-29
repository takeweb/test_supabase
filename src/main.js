// src/main.js

import { initializeAuthUI } from "./libs/auth";
import { getJoinedBooksData } from "./libs/bookUtil";
import "./style.css";

// SVGアイコンのパスを定義
//const ICON_PATH = "/book/img/";
const ICON_PATH = `${import.meta.env.BASE_URL}img/`;

// --- DOM要素への参照 ---
const appDiv = document.querySelector("#app");
let authFormElement;
let emailInputElement;
let passwordInputElement;
let togglePasswordButtonElement;
let signInButtonElement;
let signUpButtonElement;
let signOutButtonElement;
let userInfoDivElement;
let contentAreaDivElement;

// --- ページネーション関連のDOM要素 ---
let paginationContainerElement;
let firstPageButtonElement;
let prevPageButtonElement;
let nextPageButtonElement;
let lastPageButtonElement;
let pageSelectElement; // セレクトボックス要素
let pageTotalInfoElement; // ★修正：総ページ数と「ページ」を表示する要素

// --- ページネーションの状態 ---
let currentPage = 1;
const itemsPerPage = 5;
let totalBooksCount = 0;

/**
 * ページネーションUIを更新する関数
 */
function updatePaginationUI() {
  const totalPages = Math.ceil(totalBooksCount / itemsPerPage);

  if (pageSelectElement) {
    pageSelectElement.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const option = document.createElement("option");
      option.value = i;
      // ★修正：オプションテキストを現在のページ番号のみにする★
      option.textContent = `${i}`;
      if (i === currentPage) {
        option.selected = true;
      }
      pageSelectElement.appendChild(option);
    }
    pageSelectElement.disabled = totalPages <= 1;
  }

  // ★修正：総ページ数と「ページ」の文言を更新★
  if (pageTotalInfoElement) {
    pageTotalInfoElement.textContent = ` / ${totalPages} ページ`;
  }

  if (firstPageButtonElement) {
    firstPageButtonElement.disabled = currentPage === 1;
  }
  if (prevPageButtonElement) {
    prevPageButtonElement.disabled = currentPage === 1;
  }
  if (nextPageButtonElement) {
    nextPageButtonElement.disabled =
      currentPage === totalPages || totalPages === 0;
  }
  if (lastPageButtonElement) {
    lastPageButtonElement.disabled =
      currentPage === totalPages || totalPages === 0;
  }
}

/**
 * 書籍データを再ロードするヘルパー関数
 */
async function loadBooksForPage() {
  if (window.supabaseClient) {
    await getJoinedBooksData(
      window.supabaseClient,
      contentAreaDivElement,
      currentPage,
      itemsPerPage,
      (count) => {
        totalBooksCount = count;
        updatePaginationUI();
      }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div id="books-list"></div>
      </div>

      <div id="pagination-container" style="display: none;">
        <button type="button" id="first-page-btn" class="pagination-btn"></button>
        <button type="button" id="prev-page-btn" class="pagination-btn"></button>
        <div class="page-select-wrapper">
          <select id="page-select" class="pagination-select"></select>
          <span id="page-total-info"></span> </div>
        <button type="button" id="next-page-btn" class="pagination-btn"></button>
        <button type="button" id="last-page-btn" class="pagination-btn"></button>
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
  contentAreaDivElement = document.getElementById("content-area");

  // ページネーション要素への参照を取得
  paginationContainerElement = document.getElementById("pagination-container");
  firstPageButtonElement = document.getElementById("first-page-btn");
  prevPageButtonElement = document.getElementById("prev-page-btn");
  nextPageButtonElement = document.getElementById("next-page-btn");
  lastPageButtonElement = document.getElementById("last-page-btn");
  pageSelectElement = document.getElementById("page-select");
  pageTotalInfoElement = document.getElementById("page-total-info"); // ★修正：参照する要素名を変更★

  // 各ボタンにSVGアイコンを挿入
  if (firstPageButtonElement) {
    firstPageButtonElement.innerHTML = `<img src="${ICON_PATH}chevron-bar-left.svg" alt="最初へ">`;
  }
  if (prevPageButtonElement) {
    prevPageButtonElement.innerHTML = `<img src="${ICON_PATH}chevron-left.svg" alt="前へ">`;
  }
  if (nextPageButtonElement) {
    nextPageButtonElement.innerHTML = `<img src="${ICON_PATH}chevron-right.svg" alt="次へ">`;
  }
  if (lastPageButtonElement) {
    lastPageButtonElement.innerHTML = `<img src="${ICON_PATH}chevron-bar-right.svg" alt="最後へ">`;
  }

  // パスワード表示切り替えボタンのイベントリスナー
  if (togglePasswordButtonElement) {
    togglePasswordButtonElement.addEventListener("click", () => {
      if (passwordInputElement.type === "password") {
        passwordInputElement.type = "text";
        togglePasswordButtonElement.textContent = "🔒";
      } else {
        passwordInputElement.type = "password";
        togglePasswordButtonElement.textContent = "👁️";
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

  // セレクトボックスのイベントリスナー
  if (pageSelectElement) {
    pageSelectElement.addEventListener("change", (event) => {
      const selectedPage = parseInt(event.target.value, 10);
      if (selectedPage && selectedPage !== currentPage) {
        currentPage = selectedPage;
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
      paginationContainerElement,
    },
    async (supabaseInstance, user) => {
      window.supabaseClient = supabaseInstance;

      if (user) {
        currentPage = 1;
        await loadBooksForPage();
        paginationContainerElement.style.display = "flex";
      } else {
        const booksList = document.getElementById("books-list");
        if (booksList) {
          booksList.innerHTML = "";
        }
        paginationContainerElement.style.display = "none";
        if (pageSelectElement) {
          pageSelectElement.innerHTML = "";
          pageSelectElement.disabled = true;
        }
        // ★修正：ログアウト時に総ページ情報もクリア★
        if (pageTotalInfoElement) {
          pageTotalInfoElement.textContent = "";
        }
      }
    }
  );
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", renderInitialUI);
