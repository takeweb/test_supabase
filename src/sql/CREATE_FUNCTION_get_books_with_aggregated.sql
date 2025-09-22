DROP FUNCTION IF EXISTS get_books_with_aggregated_authors(int, int, bigint);

CREATE OR REPLACE FUNCTION get_books_with_aggregated_authors(
    p_offset int,
    p_limit int,
    p_tag bigint DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    title character varying,
    edition text,
    sub_title text,
    pages bigint,
    book_cover_image_name text,
    author_names character varying,
    supervisor_names character varying,
    translator_names character varying,
    translation_supervision_names character varying,
    editor_names character varying,
    publisher_name character varying,
    price bigint,
    isbn character varying,
    isbn_10 text,
    release_date date,
    format_name text,
    purchase_date date,
    tags character varying
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        WITH AuthorsAggregated AS (
            SELECT
                bp.book_id,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id)::character varying AS names
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
                STRING_AGG(p.person_name, ', ' ORDER BY p.id)::character varying AS names
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
                STRING_AGG(p.person_name, ', ' ORDER BY p.id)::character varying AS names
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
                STRING_AGG(p.person_name, ', ' ORDER BY p.id)::character varying AS names
            FROM
                book_persons bp
            INNER JOIN
                persons p ON p.id = bp.person_id
            WHERE
                bp.role_id = 5 -- 監訳者
            GROUP BY
                bp.book_id
        ),
        EditorsAggregated AS (
            SELECT
                bp.book_id,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id)::character varying AS names
            FROM
                book_persons bp
            INNER JOIN
                persons p ON p.id = bp.person_id
            WHERE
                bp.role_id = 6 -- 編集者
            GROUP BY
                bp.book_id
        ),
        TagsAggregated AS (
            SELECT
                bt.book_id,
                STRING_AGG(tg.tag_name, ', ' ORDER BY tg.tag_name)::character varying AS tags
            FROM
                book_tags bt
            INNER JOIN
                tags tg ON tg.id = bt.tag_id
            GROUP BY
                bt.book_id
        )
        SELECT
            b.id,
            b.title,
            b.edition,
            b.sub_title,
            b.pages,
            b.book_cover_image_name,
            COALESCE(aa.names, '') AS author_names,
            COALESCE(sa.names, '') AS supervisor_names,
            COALESCE(ta.names, '') AS translator_names,
            COALESCE(tsa.names, '') AS translation_supervision_names,
            COALESCE(e.names, '') AS editor_names,
            p.publisher_name,
            b.price,
            b.isbn,
            b.isbn_10,
            b.release_date,
            f.format_name,
            ub.purchase_date,
            COALESCE(tg.tags, '') AS tags
        FROM
            books b
        INNER JOIN publishers p
            ON p.id = b.publisher_id
        INNER JOIN user_books ub
            ON ub.book_id = b.id
        INNER JOIN formats f
            ON f.id = b.format_id
        LEFT JOIN AuthorsAggregated aa
            ON aa.book_id = b.id
        LEFT JOIN SupervisorsAggregated sa
            ON sa.book_id = b.id
        LEFT JOIN TranslatorsAggregated ta
            ON ta.book_id = b.id
        LEFT JOIN TranslationSupervisionsAggregated tsa
            ON tsa.book_id = b.id
        LEFT JOIN EditorsAggregated e
            ON e.book_id = b.id
        LEFT JOIN TagsAggregated tg
            ON tg.book_id = b.id
        WHERE
            (
                p_tag IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM book_tags bt
                    WHERE bt.book_id = b.id AND bt.tag_id = p_tag
                )
            )
        GROUP BY
            b.id, p.publisher_name, f.format_name, ub.purchase_date, aa.names, sa.names, ta.names, tsa.names, e.names, tg.tags
        ORDER BY
            b.id
        OFFSET p_offset
        LIMIT p_limit;
END;
$$;