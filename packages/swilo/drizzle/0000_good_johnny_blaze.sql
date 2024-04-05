CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar NOT NULL,
	"role" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
