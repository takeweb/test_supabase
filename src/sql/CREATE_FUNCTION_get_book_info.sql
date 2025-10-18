DROP FUNCTION get_book_info(p_isbn_10  character varying);
CREATE OR REPLACE FUNCTION get_book_info(p_isbn_10 character varying)
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
    illustrator_names character varying,
    publisher_name character varying,
    price bigint,
    isbn character varying,
    isbn_10 text,
    release_date date,
    format_name text,
    purchase_date date,
    read_end_date date,
    tags character varying,
    label_name text,
    classification_code text
)
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
    RETURN QUERY
        WITH role_agg AS (
            SELECT
                bc.book_id,
                bc.role_id,
                STRING_AGG(p.creator_name, ', ' ORDER BY p.id)::character varying AS names
            FROM
                book_creators bc
            JOIN creators p ON p.id = bc.creator_id
            GROUP BY bc.book_id, bc.role_id
        ),
        tags_agg AS (
            SELECT
                bt.book_id,
                STRING_AGG(tg.tag_name, ', ' ORDER BY tg.tag_name)::character varying AS tags
            FROM
                book_tags bt
            JOIN tags tg ON tg.id = bt.tag_id
            GROUP BY bt.book_id
        )
        SELECT
            b.id,
            b.title,
            b.edition,
            b.sub_title,
            b.pages,
            b.book_cover_image_name,
            COALESCE(a.names, '') AS author_names,
            COALESCE(s.names, '') AS supervisor_names,
            COALESCE(t.names, '') AS translator_names,
            COALESCE(ts.names, '') AS translation_supervision_names,
            COALESCE(e.names, '') AS editor_names,
            COALESCE(i.names, '') AS illustrator_names,
            p.publisher_name,
            b.price,
            b.isbn,
            b.isbn_10,
            b.release_date,
            f.format_name,
            ub.purchase_date,
            ub.read_end_date,
            COALESCE(tg.tags, '') AS tags,
            l.label_name,
            b.classification_code
        FROM books b
            INNER JOIN publishers p
                ON p.id = b.publisher_id
            INNER JOIN user_books ub
                ON ub.book_id = b.id
            INNER JOIN formats f
                ON f.id = b.format_id
            LEFT JOIN labels l
                ON l.id = b.label_id
            LEFT JOIN role_agg a ON a.book_id = b.id AND a.role_id = 1
            LEFT JOIN role_agg s ON s.book_id = b.id AND s.role_id = 2
            LEFT JOIN role_agg t ON t.book_id = b.id AND t.role_id = 4
            LEFT JOIN role_agg ts ON ts.book_id = b.id AND ts.role_id = 5
            LEFT JOIN role_agg e ON e.book_id = b.id AND e.role_id = 6
            LEFT JOIN role_agg i ON e.book_id = b.id AND e.role_id = 7
            LEFT JOIN tags_agg tg ON tg.book_id = b.id
        WHERE
          b.isbn_10 = p_isbn_10
        LIMIT 1;
END;
$$;
