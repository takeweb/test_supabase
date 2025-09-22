DROP FUNCTION get_book_info(p_isbn_10 INT);
CREATE OR REPLACE FUNCTION get_book_info(p_isbn_10 character varying)
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
    editor_names text,
    publisher_name character varying,
    price bigint,
    isbn character varying,
    isbn_10 text,
    release_date date,
    format_name text,
    purchase_date date
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        WITH PersonsAggregated AS (
            SELECT
                bp.book_id,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id) FILTER (WHERE bp.role_id = 1) AS author_names,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id) FILTER (WHERE bp.role_id = 2) AS supervisor_names,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id) FILTER (WHERE bp.role_id = 4) AS translator_names,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id) FILTER (WHERE bp.role_id = 5) AS translation_supervision_names,
                STRING_AGG(p.person_name, ', ' ORDER BY p.id) FILTER (WHERE bp.role_id = 6) AS editor_names
            FROM
                book_persons bp
            INNER JOIN
                persons p ON p.id = bp.person_id
            WHERE
                bp.role_id IN (1, 2, 4, 5, 6)
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
            COALESCE(pa.author_names, '') AS author_names,
            COALESCE(pa.supervisor_names, '') AS supervisor_names,
            COALESCE(pa.translator_names, '') AS translator_names,
            COALESCE(pa.translation_supervision_names, '') AS translation_supervision_names,
            COALESCE(pa.editor_names, '') AS editor_names,
            p.publisher_name,
            b.price,
            b.isbn,
            b.isbn_10,
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
        LEFT JOIN PersonsAggregated pa
            ON pa.book_id = b.id
        WHERE
          b.isbn_10 = p_isbn_10
        LIMIT 1;
END;
$$;