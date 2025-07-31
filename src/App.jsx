// src/App.jsx
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import BookList from "./components/BookList";
import Pagination from "./components/Pagination";
import TagSelect from "./components/TagSelect";
import { handleSignUp as authHandleSignUp, handleSignIn, handleSignOut } from "./libs/auth";
import { getJoinedBooksData, getTagSelectData } from "./libs/bookUtil";
import { supabase } from "./libs/supabaseClient";

function App() {
  // 認証・UI状態
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [authError, setAuthError] = useState("");

  // データ状態
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 認証状態監視
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // タグ一覧取得
  useEffect(() => {
    if (!user) return;
    getTagSelectData(supabase).then(tags => setTags(tags || []));
  }, [user]);

  // 書籍データ取得
  useEffect(() => {
    if (!user) return;
    // getJoinedBooksDataの引数に合わせて呼び出し
    getJoinedBooksData(
      supabase,
      currentPage,
      5, // itemsPerPage
      (count) => setTotalPages(Math.max(1, Math.ceil(count / 5))),
      selectedTag === "" ? null : selectedTag
    ).then((books) => {
      // getJoinedBooksDataの戻り値をsetBooksで反映
      if (books) setBooks(books);
    });
  }, [user, selectedTag, currentPage]);

  // ログイン
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    await handleSignIn(email, password, (supabase, user) => {
      if (!user) {
        setAuthError("ログインに失敗しました");
      } else {
        setUser(user);
      }
    });
  };

  // サインアップ
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError("");
    await authHandleSignUp(email, password, (error, user) => {
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMode("login");
      }
    });
  };

  // ログアウト
  const handleLogout = async () => {
    await handleSignOut((error) => {
      if (!error) setUser(null);
    });
  };

  return (
    <div className="app-container">
      <h1>Supabase 書籍リスト</h1>
      {/* 認証UI */}
      {!user ? (
        <AuthForm
          authMode={authMode}
          email={email}
          password={password}
          authError={authError}
          setEmail={setEmail}
          setPassword={setPassword}
          setAuthMode={setAuthMode}
          handleLogin={handleLogin}
          handleSignUp={handleSignUp}
        />
      ) : (
        <div className="user-info-area">
          <span>ログイン中: {user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      )}

      {/* タグセレクト（ログイン時のみ） */}
      {user && (
        <TagSelect
          tags={tags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* 書籍リスト（ログイン時のみ） */}
      {user && (
        <BookList books={books} />
      )}


      {/* ページネーション（ログイン時のみ） */}
      {user && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

export default App;
