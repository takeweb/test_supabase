SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '9157ef1c-0249-452e-96f9-82d6296c559d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"takeweb@mac.com","user_id":"a1bab5db-9ab9-419b-aefb-f813ceb95cde","user_phone":""}}', '2025-06-10 09:31:16.989959+09', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'a1bab5db-9ab9-419b-aefb-f813ceb95cde', 'authenticated', 'authenticated', 'takeweb@mac.com', '$2a$10$m7a2aaaSalwC.WwMHq2rkew3vJpzWVkUO7EQoCwFvlEC/diI0A6.G', '2025-06-10 09:31:16.995832+09', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-06-10 09:31:16.967441+09', '2025-06-10 09:31:16.998803+09', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('a1bab5db-9ab9-419b-aefb-f813ceb95cde', 'a1bab5db-9ab9-419b-aefb-f813ceb95cde', '{"sub": "a1bab5db-9ab9-419b-aefb-f813ceb95cde", "email": "takeweb@mac.com", "email_verified": false, "phone_verified": false}', 'email', '2025-06-10 09:31:16.987677+09', '2025-06-10 09:31:16.987736+09', '2025-06-10 09:31:16.987736+09', 'e9ee4646-18ab-4a9e-a500-67ed8c2a78c7');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."authors" ("id", "created_at", "author_name", "date_of_birth", "gender", "nationality") VALUES
	(1, '2025-06-10 08:53:49.638067+09', 'Dan Vanderkam', NULL, NULL, NULL),
	(2, '2025-06-10 08:53:49.638067+09', '井上 誠一郎', NULL, NULL, NULL),
	(3, '2025-06-10 08:53:49.638067+09', 'hikalium', NULL, NULL, NULL),
	(4, '2025-06-11 09:23:58.068076+09', 'KEEN', NULL, NULL, NULL),
	(5, '2025-06-11 09:24:30.351275+09', 'クジラ飛行机', NULL, NULL, NULL),
	(6, '2025-06-11 09:25:29.65557+09', '掌田津耶乃', NULL, NULL, NULL),
	(7, '2025-06-11 09:26:15.267823+09', '増田 智明', NULL, NULL, NULL),
	(8, '2025-06-11 09:26:31.457144+09', '原 旅人', NULL, NULL, NULL),
	(9, '2025-06-11 09:26:59.178312+09', 'mebiusbox', NULL, NULL, NULL),
	(10, '2025-06-11 09:27:44.683968+09', '中村 智之', NULL, NULL, NULL),
	(11, '2025-06-11 09:29:12.649528+09', '山田 祥寛', NULL, NULL, NULL),
	(12, '2025-06-11 09:29:31.413458+09', '齊藤 新三', NULL, NULL, NULL),
	(13, '2025-06-11 09:30:21.426226+09', '山内 直', NULL, NULL, NULL),
	(14, '2025-06-11 09:32:30.638496+09', '山本 陽平', NULL, NULL, NULL),
	(15, '2025-06-11 09:41:26.86981+09', '初田 直也', NULL, NULL, NULL);


--
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."publishers" ("id", "created_at", "publisher_name", "address", "capital", "website") VALUES
	(1, '2025-06-10 09:18:48.005711+09', 'オライリー・ジャパン', NULL, NULL, NULL),
	(2, '2025-06-10 09:18:48.005711+09', '技術評論社', NULL, NULL, NULL),
	(3, '2025-06-10 09:18:48.005711+09', 'オーム社', NULL, NULL, NULL),
	(4, '2025-06-10 09:18:48.005711+09', 'ASCII DWANGO', NULL, NULL, NULL),
	(5, '2025-06-10 09:18:48.005711+09', '翔泳社', NULL, NULL, NULL),
	(6, '2025-06-11 09:33:57.122087+09', 'マイナビ', NULL, NULL, NULL),
	(7, '2025-06-11 09:34:36.804531+09', 'ソシム', NULL, NULL, NULL),
	(8, '2025-06-11 09:34:55.537229+09', '日経BP', NULL, NULL, NULL),
	(9, '2025-06-11 09:42:21.19289+09', '秀和システム', NULL, NULL, NULL);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."books" ("id", "created_at", "book_name", "author_id", "publisher_id", "price", "ISBN", "Impression") VALUES
	(1, '2025-06-10 08:41:17.345774+09', 'Effective TypeScript', 1, 1, 4200, 'ISBN978-4-8144-0109-3', NULL),
	(2, '2025-06-10 08:41:17.345774+09', 'パーフェクトJava', 2, 2, 3400, 'ISBN978-4-297-14680-1', NULL),
	(3, '2025-06-10 08:41:17.345774+09', '[作って学ぶ]OSの仕組み', 3, 2, 3200, 'ISBN978-4-297-14859-1', NULL),
	(4, '2025-06-11 09:39:49.216613+09', '実践Rust入門', 4, 2, 4378, '978-4297105594', NULL),
	(5, '2025-06-11 09:43:09.822937+09', '実践Rustプログラミング入門', 15, 9, 3960, '978-4798061702', NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."authors_id_seq"', 15, true);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."books_id_seq"', 5, true);


--
-- Name: publishers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."publishers_id_seq"', 9, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
