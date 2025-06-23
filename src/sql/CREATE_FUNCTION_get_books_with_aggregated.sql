DROP FUNCTION get_books_with_aggregated_authors();
CREATE OR REPLACE FUNCTION get_books_with_aggregated_authors()
RETURNS TABLE (
  id bigint,
  title character varying,
  edition text,
  sub_title text,
  pages bigint,
  book_cover_image_name text,
  author_names text,
  supervisor_names text,
  translator_names text,
  translation_supervision_names text,
  publisher_name character varying,
  price bigint,
  isbn character varying,
  release_date date,
  format_name text,
  purchase_date date
)
LANGUAGE plpgsql AS $$

BEGIN
  RETURN QUERY
    WITH AuthorsAggregated AS (
        SELECT
            bp.book_id,
            -- book_idとperson_nameで重複を排除し、person_idでソートして結合
            STRING_AGG(p.person_name, ', ' ORDER BY p.id) AS names
        FROM
            book_persons bp
        INNER JOIN
            persons p ON p.id = bp.person_id
        WHERE
            bp.role_id = 1 -- 著者
        GROUP BY
            bp.book_id
    ),
    SupervisorsAggregated AS (
        SELECT
            bp.book_id,
            STRING_AGG(p.person_name, ', ' ORDER BY p.id) AS names
        FROM
            book_persons bp
        INNER JOIN
            persons p ON p.id = bp.person_id
        WHERE
            bp.role_id = 2 -- 監修者
        GROUP BY
            bp.book_id
    ),
    TranslatorsAggregated AS (
        SELECT
            bp.book_id,
            STRING_AGG(p.person_name, ', ' ORDER BY p.id) AS names
        FROM
            book_persons bp
        INNER JOIN
            persons p ON p.id = bp.person_id
        WHERE
            bp.role_id = 4 -- 翻訳者
        GROUP BY
            bp.book_id
    ),
    TranslationSupervisionsAggregated AS (
        SELECT
            bp.book_id,
            STRING_AGG(p.person_name, ', ' ORDER BY p.id) AS names
        FROM
            book_persons bp
        INNER JOIN
            persons p ON p.id = bp.person_id
        WHERE
            bp.role_id = 5 -- 監訳者
        GROUP BY
            bp.book_id
    )
    SELECT
        b.id,
        b.title,
        b.edition,
        b.sub_title,
        b.pages,
        b.book_cover_image_name,
        COALESCE(aa.names, '') AS author_names, -- 結合結果がない場合は空文字列
        COALESCE(sa.names, '') AS supervisor_names,
        COALESCE(ta.names, '') AS translator_names,
        COALESCE(tsa.names, '') AS translation_supervision_names,
        p.publisher_name,
        b.price,
        b.isbn,
        b.release_date,
        f.format_name,
        ub.purchase_date
    FROM
        books b
    INNER JOIN publishers p
        ON p.id = b.publisher_id
    INNER JOIN user_books ub
        ON ub.book_id = b.id
    INNER JOIN formats f
        ON f.id = b.format_id
    -- 各CTEをLEFT JOINして、既に結合済みの名前リストを取得
    LEFT JOIN AuthorsAggregated aa
        ON aa.book_id = b.id
    LEFT JOIN SupervisorsAggregated sa
        ON sa.book_id = b.id
    LEFT JOIN TranslatorsAggregated ta
        ON ta.book_id = b.id
    LEFT JOIN TranslationSupervisionsAggregated tsa
        ON tsa.book_id = b.id
    ORDER BY
        b.id;
END;
$$;