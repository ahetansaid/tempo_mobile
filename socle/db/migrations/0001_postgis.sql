-- =====================================================================
-- TEMPO — Ce que Drizzle ne peut pas exprimer : PostGIS, index spatial,
-- et la contrainte anti-double-booking. À exécuter APRÈS `drizzle-kit push`.
-- =====================================================================

-- 1. Extensions requises
CREATE EXTENSION IF NOT EXISTS postgis;      -- géographie / ST_DWithin
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- nécessaire à l'EXCLUDE (mix = et &&)

-- 2. Index spatial sur la position des professionnels (recherche F1 rapide)
CREATE INDEX IF NOT EXISTS pro_position_gix
  ON professionnels USING gist (position);

-- 3. Anti-double-booking (F3) — GARANTI PAR LA BASE
--    Colonne générée : la plage horaire de la réservation.
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS plage_horaire tstzrange
  GENERATED ALWAYS AS (tstzrange(debut, fin, '[)')) STORED;

--    Deux réservations actives d'un même pro ne peuvent pas se chevaucher.
ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS resa_pas_de_chevauchement;
ALTER TABLE reservations
  ADD CONSTRAINT resa_pas_de_chevauchement
  EXCLUDE USING gist (
    pro_id        WITH =,
    plage_horaire WITH &&
  )
  WHERE (statut IN ('en_attente', 'confirmee'));

-- 4. Même logique pour les indisponibilités posées par le pro (optionnel mais utile)
ALTER TABLE disponibilites
  ADD COLUMN IF NOT EXISTS plage_horaire tstzrange
  GENERATED ALWAYS AS (tstzrange(debut, fin, '[)')) STORED;

-- Note : une réservation qui viole la contrainte lève une erreur SQL 23P01
-- (exclusion_violation) — à capturer dans l'API pour renvoyer « créneau déjà pris ».
