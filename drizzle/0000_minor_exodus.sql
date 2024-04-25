CREATE TABLE IF NOT EXISTS "password" (
	"hashedPassword" text NOT NULL,
	"userId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expirationDate" date NOT NULL,
	"createdAt" date DEFAULT now(),
	"updatedAt" date DEFAULT now(),
	"userId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" date,
	"type" text NOT NULL,
	"target" text NOT NULL,
	"secret" text NOT NULL,
	"digits" integer NOT NULL,
	"period" integer NOT NULL,
	"charSet" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typeIdx" ON "verification" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "targetIdx" ON "verification" ("target");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password" ADD CONSTRAINT "password_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
