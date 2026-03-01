--
-- PostgreSQL database dump
--

\restrict AwFlUSCzeAU1DcI6lo6fJL0F2RIoulLpZS5DUa1fwAnCn34I4lbyFFFbGhvrFgw

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Game; Type: TABLE; Schema: public; Owner: chessuser
--

CREATE TABLE public."Game" (
    id text NOT NULL,
    "whitePlayerId" text NOT NULL,
    "blackPlayerId" text NOT NULL,
    result text NOT NULL,
    "resultMethod" text NOT NULL,
    "movesPGN" text NOT NULL,
    "movesArray" jsonb NOT NULL,
    "finalPosition" text NOT NULL,
    "moveCount" integer NOT NULL,
    "timeControl" text NOT NULL,
    "whiteTimeLeft" integer,
    "blackTimeLeft" integer,
    duration integer NOT NULL,
    opening text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Game" OWNER TO chessuser;

--
-- Name: User; Type: TABLE; Schema: public; Owner: chessuser
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    "emailVerified" timestamp(3) without time zone,
    "verificationToken" text,
    "resetPasswordToken" text,
    "resetPasswordExpiry" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar text,
    bio text,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    draws integer DEFAULT 0 NOT NULL,
    "lastGameAt" timestamp(3) without time zone,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    losses integer DEFAULT 0 NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    "totalGames" integer DEFAULT 0 NOT NULL,
    username text,
    wins integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO chessuser;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: chessuser
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO chessuser;

--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: chessuser
--

COPY public."Game" (id, "whitePlayerId", "blackPlayerId", result, "resultMethod", "movesPGN", "movesArray", "finalPosition", "moveCount", "timeControl", "whiteTimeLeft", "blackTimeLeft", duration, opening, "createdAt", "endedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: chessuser
--

COPY public."User" (id, email, password, name, "emailVerified", "verificationToken", "resetPasswordToken", "resetPasswordExpiry", "createdAt", "updatedAt", avatar, bio, "currentStreak", draws, "lastGameAt", "longestStreak", losses, rating, "totalGames", username, wins) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: chessuser
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e7199a47-3c4e-4095-9dea-c88c743d4e48	9224556e1262ac45fd9c65e30d5537f90e69df782563fd6cd67da1989c9c8dd0	2026-03-01 11:50:15.166419+00	20260214060107_init_auth	\N	\N	2026-03-01 11:50:15.154379+00	1
43e601b9-c8e1-43da-ba22-5db6c7880396	d39f72e83556621d1849c04c31822e31c6d6ee8fc75d6d0f673e48e84fc75e99	2026-03-01 11:50:15.171639+00	20260216025138_add_player_stats	\N	\N	2026-03-01 11:50:15.167063+00	1
5b44c542-0ba8-477d-a480-3db22dd32308	b17324ba437a57b2cd0cba6377b56d77c200baf85fb1a1e009394b2613d2f380	2026-03-01 11:50:15.180436+00	20260222162030_add_game_history	\N	\N	2026-03-01 11:50:15.172244+00	1
\.


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: chessuser
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: chessuser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: chessuser
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: chessuser
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_resetPasswordToken_key; Type: INDEX; Schema: public; Owner: chessuser
--

CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON public."User" USING btree ("resetPasswordToken");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: chessuser
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: User_verificationToken_key; Type: INDEX; Schema: public; Owner: chessuser
--

CREATE UNIQUE INDEX "User_verificationToken_key" ON public."User" USING btree ("verificationToken");


--
-- Name: Game Game_blackPlayerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chessuser
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Game Game_whitePlayerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chessuser
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict AwFlUSCzeAU1DcI6lo6fJL0F2RIoulLpZS5DUa1fwAnCn34I4lbyFFFbGhvrFgw

