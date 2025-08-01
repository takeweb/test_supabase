// libs/auth.js

import { supabase } from "./supabaseClient"; // supabaseClientをインポート

// 認証関連のDOM要素への参照 (main.jsから渡されるか、ここで取得)
let authForm;
let emailInput;
let passwordInput;
let signInButton;
let signUpButton;
let signOutButton;
let userInfoDiv;
let contentAreaDiv; // 書籍リスト表示領域も更新する必要があるため
let paginationContainerDiv;
// ★追加：booksListElement の参照も保持する
let booksListElement;
let tagSelectAreaDiv; // タグセレクトの親要素

/**
 * 認証関連のDOM要素を設定する関数
 * main.js から必要な要素を渡してもらう
 * @param {object} elements
 * @param {HTMLElement} elements.authFormElement
 * @param {HTMLInputElement} elements.emailInputElement
 * @param {HTMLInputElement} elements.passwordInputElement
 * @param {HTMLButtonElement} elements.signInButtonElement
 * @param {HTMLButtonElement} elements.signUpButtonElement
 * @param {HTMLButtonElement} elements.signOutButtonElement
 * @param {HTMLElement} elements.userInfoDivElement
 * @param {HTMLElement} elements.contentAreaDivElement
 * @param {HTMLElement} elements.paginationContainerElement
 * @param {HTMLElement} elements.tagSelectAreaElement
 * @param {Function} onLoginSuccessCallback - ログイン成功時に呼び出すコールバック関数
 */
export function initializeAuthUI(elements, onLoginSuccessCallback) {
  authForm = elements.authFormElement;
  emailInput = elements.emailInputElement;
  passwordInput = elements.passwordInputElement;
  signInButton = elements.signInButtonElement;
  signUpButton = elements.signUpButtonElement;
  signOutButton = elements.signOutButtonElement;
  userInfoDiv = elements.userInfoDivElement;
  contentAreaDiv = elements.contentAreaDivElement; // main.jsから渡された参照を保持
  paginationContainerDiv = elements.paginationContainerElement;
  tagSelectAreaDiv = elements.tagSelectAreaElement; // タグセレクトの親要素

  // ★追加：booksListElement の参照を取得
  booksListElement = document.getElementById("books-list");

  // --- イベントリスナーの追加 ---
  if (authForm) {
    // submitイベントリスナーを変更し、preventDefaultを内部で実行
    authForm.addEventListener("submit", (e) => {
      e.preventDefault(); // デフォルトのフォーム送信を防止
      handleSignIn(onLoginSuccessCallback); // イベントオブジェクトを渡さない
    });
  }
  if (signUpButton) {
    signUpButton.addEventListener("click", handleSignUp);
  }
  if (signOutButton) {
    signOutButton.addEventListener("click", handleSignOut);
  }

  // 初期ロード時のセッション確認と認証状態の監視を開始
  checkInitialSession(onLoginSuccessCallback);
  setupAuthStateChangeListener(onLoginSuccessCallback);
}

/**
 * ログイン処理
 * @param {Function} onLoginSuccessCallback - ログイン成功時に呼び出すコールバック関数
 */
export async function handleSignIn(email, password, onLoginSuccessCallback) {
  // email/passwordを引数で受け取る

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("ログインエラー: " + error.message);
      console.error("ログインエラー:", error);
      return;
    }

    if (data && data.user) {
      // React用: コールバックがあればsupabaseとuserを渡す
      if (onLoginSuccessCallback) onLoginSuccessCallback(supabase, data.user);
    }
  } catch (error) {
    console.error("予期せぬログインエラー:", error);
    alert("予期せぬログインエラーが発生しました。");
  }
}

/**
 * サインアップ処理
 */
export async function handleSignUp(email, password, onSignUpResult) {
  // email/passwordを引数で受け取る

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (onSignUpResult) onSignUpResult(error, null);
      return;
    }

    if (data && data.user) {
      if (onSignUpResult) onSignUpResult(null, data.user);
    } else if (data && data.session === null && data.user === null) {
      if (onSignUpResult) onSignUpResult(null, null);
    }
  } catch (error) {
    console.error("予期せぬサインアップエラー:", error);
    alert("予期せぬサインアップエラーが発生しました。");
  }
}

/**
 * ログアウト処理
 */
export async function handleSignOut(onSignOutResult) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    if (onSignOutResult) onSignOutResult(error);
    return;
  }
  if (onSignOutResult) onSignOutResult(null);
}

/**
 * 認証状態に応じてUIを更新するヘルパー関数
 * @param {object|null} session - 現在のSupabaseセッションオブジェクト
 */
function updateAuthUI(session) {
  if (session) {
    userInfoDiv.textContent = `ログイン中: ${session.user.email}`;
    if (authForm) authForm.style.display = "none";
    if (signOutButton) signOutButton.style.display = "block";
    // ログイン時はページネーションを表示
    if (paginationContainerDiv) {
      paginationContainerDiv.style.display = "flex"; // または 'block'
    }
    // ログイン時はタグセレクトエリアを表示（もしあれば）
    const tagSelectArea = document.getElementById("tag-select-area");
    if (tagSelectArea) tagSelectArea.style.display = "block";
  } else {
    userInfoDiv.textContent = "ログインしていません";
    if (authForm) authForm.style.display = "flex";
    if (signOutButton) signOutButton.style.display = "none";

    // ログアウト時はページネーションを非表示
    if (paginationContainerDiv) {
      paginationContainerDiv.style.display = "none";
    }
    // ログアウト時はタグセレクトエリアを非表示
    const tagSelectArea = document.getElementById("tag-select-area");
    if (tagSelectArea) tagSelectArea.style.display = "none";
  }
}

/**
 * 初期ロード時にセッションを確認する
 * @param {Function} onLoginSuccessCallback - ログイン成功時に呼び出すコールバック関数
 */
async function checkInitialSession(onLoginSuccessCallback) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  updateAuthUI(session); // 初期ロード時にUIを更新し、ページネーションの表示も制御
  if (session) {
    console.log("初期ロード時にセッションが存在します:", session.user.email);
    // ログイン成功時のコールバックを呼び出す際、supabaseとuserを渡す
    onLoginSuccessCallback(supabase, session.user);
  } else {
    console.log("初期ロード時にセッションは存在しません。");
    // セッションがない場合も明示的にページネーションを非表示にする
    if (paginationContainerDiv) {
      paginationContainerDiv.style.display = "none";
    }
    // ★追加：ログアウト状態の場合、booksListElement の内容もクリアする
    if (booksListElement) {
      booksListElement.innerHTML = "";
    }
  }
}

/**
 * 認証状態の変更を監視し、UIとコンテンツを更新する
 * @param {Function} onLoginSuccessCallback - ログイン成功時に呼び出すコールバック関数
 */
function setupAuthStateChangeListener(onLoginSuccessCallback) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("認証状態変更イベント:", event, session);
    updateAuthUI(session); // 認証状態の変化時にUIを更新し、ページネーションの表示も制御
    if (session) {
      // ログイン時 (またはセッション更新時)
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // ログイン成功時のコールバックを呼び出す際、supabaseとuserを渡す
        onLoginSuccessCallback(supabase, session.user);
      }
    } else {
      // ログアウト時
      // ★変更：contentAreaDiv.innerHTML をクリアする代わりに booksListElement.innerHTML をクリアする
      if (booksListElement) {
        booksListElement.innerHTML = ""; // 書籍リストの内容のみをクリア
      }
      // authUIがすでにpaginationContainerDivを非表示にするため、ここでは不要だが念のため
      if (paginationContainerDiv) {
        paginationContainerDiv.style.display = "none";
      }
    }
  });
}
