// libs/auth.js (修正後)

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
async function handleSignIn(onLoginSuccessCallback) {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("ログインエラー: " + error.message);
      console.error("ログインエラー:", error);
      return;
    }

    if (data && data.user) {
      alert("ログイン成功！");
      console.log("ログインユーザー:", data.user);
      // ログイン成功時にコールバックを呼び出す際、supabaseとcontentAreaDivを渡す
      onLoginSuccessCallback(supabase, contentAreaDiv);
    }
  } catch (error) {
    console.error("予期せぬログインエラー:", error);
    alert("予期せぬログインエラーが発生しました。");
  }
}

/**
 * サインアップ処理
 */
async function handleSignUp() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert("サインアップエラー: " + error.message);
      console.error("サインアップエラー:", error);
      return;
    }

    if (data && data.user) {
      alert("サインアップ成功！メールをご確認ください。");
      console.log("サインアップユーザー:", data.user);
    } else if (data && data.session === null && data.user === null) {
      alert(
        "登録が成功しました。メールを確認してアカウントを有効化してください。"
      );
    }
  } catch (error) {
    console.error("予期せぬサインアップエラー:", error);
    alert("予期せぬサインアップエラーが発生しました。");
  }
}

/**
 * ログアウト処理
 */
async function handleSignOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("ログアウトエラー: " + error.message);
    console.error("ログアウトエラー:", error);
    return;
  }

  alert("ログアウトしました。");
  console.log("ログアウト成功");
  updateAuthUI(null); // UIをログアウト状態に更新
  if (contentAreaDiv) {
    // 書籍リスト表示領域をクリア
    contentAreaDiv.innerHTML = "";
  }
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
  } else {
    userInfoDiv.textContent = "ログインしていません";
    if (authForm) authForm.style.display = "flex";
    if (signOutButton) signOutButton.style.display = "none";
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
  updateAuthUI(session);
  if (session) {
    console.log("初期ロード時にセッションが存在します:", session.user.email);
    // ログイン成功時のコールバックを呼び出す際、supabaseとcontentAreaDivを渡す
    onLoginSuccessCallback(supabase, contentAreaDiv);
  } else {
    console.log("初期ロード時にセッションは存在しません。");
  }
}

/**
 * 認証状態の変更を監視し、UIとコンテンツを更新する
 * @param {Function} onLoginSuccessCallback - ログイン成功時に呼び出すコールバック関数
 */
function setupAuthStateChangeListener(onLoginSuccessCallback) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("認証状態変更イベント:", event, session);
    updateAuthUI(session);
    if (session) {
      // ログイン時 (またはセッション更新時)
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // ログイン成功時のコールバックを呼び出す際、supabaseとcontentAreaDivを渡す
        onLoginSuccessCallback(supabase, contentAreaDiv);
      }
    } else {
      // ログアウト時
      if (contentAreaDiv) {
        contentAreaDiv.innerHTML = ""; // 書籍リストをクリア
      }
    }
  });
}
