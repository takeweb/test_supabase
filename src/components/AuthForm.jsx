
function AuthForm({ authMode, email, password, authError, setEmail, setPassword, setAuthMode, handleLogin, handleSignUp }) {
  return (
    <form onSubmit={authMode === "login" ? handleLogin : handleSignUp} className="auth-form">
      <div className="auth-form-row">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="auth-input"
        />
      </div>
      <div className="auth-form-row">
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="auth-input"
        />
      </div>
      {authError && <div className="auth-error">{authError}</div>}
      <div className="auth-form-row">
        <button type="submit" className="auth-submit-btn">
          {authMode === "login" ? "ログイン" : "サインアップ"}
        </button>
        <button type="button" className="auth-switch-btn" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
          {authMode === "login" ? "新規登録" : "ログイン画面へ"}
        </button>
      </div>
    </form>
  );
}

export default AuthForm;
