CREATE TYPE "public"."abonnement_statut" AS ENUM('pilote_gratuit', 'actif', 'suspendu', 'resilie');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('reservation_recue', 'confirmation', 'rappel_j1', 'rappel_h1', 'modification', 'annulation');--> statement-breakpoint
CREATE TYPE "public"."reservation_statut" AS ENUM('en_attente', 'confirmee', 'terminee', 'annulee', 'absente');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('pro', 'admin');--> statement-breakpoint
CREATE TABLE "abonnements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" uuid NOT NULL,
	"statut" "abonnement_statut" DEFAULT 'pilote_gratuit' NOT NULL,
	"debute_par" timestamp with time zone,
	"prochaine_echeance" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "appareils_fcm" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"plateforme" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appareils_fcm_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "disponibilites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" uuid NOT NULL,
	"debut" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"bloque" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notif_type" NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"du_a" timestamp with time zone NOT NULL,
	"lu" boolean DEFAULT false NOT NULL,
	"envoye" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professionnels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nom" text NOT NULL,
	"slug" text NOT NULL,
	"telephone" text,
	"adresse" text,
	"ville" text,
	"position" "geography(Point,4326)",
	"photo_url" text,
	"horaires" jsonb DEFAULT '{}' NOT NULL,
	"score_fiabilite" numeric(3, 1),
	"publie" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professionnels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" uuid NOT NULL,
	"service_id" uuid,
	"client_user_id" text,
	"client_nom" text NOT NULL,
	"client_tel" text NOT NULL,
	"debut" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"statut" "reservation_statut" DEFAULT 'en_attente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" uuid NOT NULL,
	"libelle" text NOT NULL,
	"duree_min" integer NOT NULL,
	"prix_fcfa" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_pro_id_professionnels_id_fk" FOREIGN KEY ("pro_id") REFERENCES "public"."professionnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_pro_id_professionnels_id_fk" FOREIGN KEY ("pro_id") REFERENCES "public"."professionnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pro_id_professionnels_id_fk" FOREIGN KEY ("pro_id") REFERENCES "public"."professionnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_pro_id_professionnels_id_fk" FOREIGN KEY ("pro_id") REFERENCES "public"."professionnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dispo_pro_debut_idx" ON "disponibilites" USING btree ("pro_id","debut");--> statement-breakpoint
CREATE INDEX "notif_dus_idx" ON "notifications" USING btree ("du_a") WHERE envoye = false;--> statement-breakpoint
CREATE INDEX "pro_ville_idx" ON "professionnels" USING btree ("ville");--> statement-breakpoint
CREATE INDEX "resa_pro_debut_idx" ON "reservations" USING btree ("pro_id","debut");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");