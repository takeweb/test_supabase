
function AuthForm({ authMode, email, password, authError, setEmail, setPassword, setAuthMode, handleLogin, handleSignUp }) {
  return (
    <form
      onSubmit={authMode === "login" ? handleLogin : handleSignUp}
      className="w-full max-w-sm mx-auto bg-white p-8 rounded-lg shadow-md flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-center mb-2">{authMode === "login" ? "ログイン" : "サインアップ"}</h2>
      <div>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {authError && (
        <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded p-2">{authError}</div>
      )}
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
        >
          {authMode === "login" ? "ログイン" : "サインアップ"}
        </button>
        <button
          type="button"
          className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
        >
          {authMode === "login" ? "新規登録" : "ログイン画面へ"}
        </button>
      </div>
    </form>
  );
}

export default AuthForm;
