# Supabase 書籍リスト

## 登録手順
* booksに本を登録
  * title・・・・・必須
  * edition・・・・任意
  * sub_title・・・任意
  * publish_id・・・publishersからidを選択
  * price・・・・・Amazonから値段を貼り付け
  * isbn・・・・・・AmazonからISBN-13を貼り付け
  * release_date・・Amazonから発売日を貼り付け
  * format_id・・formatsからidを選択
* creatorsに著者を登録
  * creator_name・・・著者名を登録
* book_creators
  * book_id・・・booksからidを選択
  * creator_id・・・creatorsからidを選択
  * role_id・・・rolesからidを選択
* user_books
  * user_id・・・ログイン者のUUID
  * book_id・・・booksからidを選択
  * purchase_date・・・購入日を入力
