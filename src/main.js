// src/main.js

import { initializeAuthUI } from "./libs/auth";
import { getJoinedBooksData } from "./libs/bookUtil";
import "./style.css"; // 既存のスタイルシート

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

      <div id="content-area">
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
  // ここで getJoinedBooksData に supabase インスタンスと contentAreaDivElement を渡す
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
    // ここで getJoinedBooksData を直接呼び出すように変更
    async (supabaseInstance, contentArea) => {
      await getJoinedBooksData(supabaseInstance, contentArea);
    }
  );
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", renderInitialUI);
