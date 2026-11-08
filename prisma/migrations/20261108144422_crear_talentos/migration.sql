-- CreateEnum
CREATE TYPE "nivel_talento" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- CreateTable
CREATE TABLE "categoria_talento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,

    CONSTRAINT "categoria_talento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talento" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,

    CONSTRAINT "talento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitante_talento" (
    "habitante_id" INTEGER NOT NULL,
    "talento_id" INTEGER NOT NULL,
    "nivel" "nivel_talento" NOT NULL,
    "anios_experiencia" SMALLINT NOT NULL DEFAULT 0,
    "certificado" BOOLEAN NOT NULL DEFAULT false,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "habitante_talento_pkey" PRIMARY KEY ("habitante_id","talento_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_talento_nombre_key" ON "categoria_talento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "talento_nombre_key" ON "talento"("nombre");

-- CreateIndex
CREATE INDEX "talento_categoria_id_idx" ON "talento"("categoria_id");

-- CreateIndex
CREATE INDEX "habitante_talento_talento_id_idx" ON "habitante_talento"("talento_id");

-- AddForeignKey
ALTER TABLE "talento" ADD CONSTRAINT "talento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_talento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitante_talento" ADD CONSTRAINT "habitante_talento_habitante_id_fkey" FOREIGN KEY ("habitante_id") REFERENCES "habitante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitante_talento" ADD CONSTRAINT "habitante_talento_talento_id_fkey" FOREIGN KEY ("talento_id") REFERENCES "talento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Los años de experiencia no pueden ser negativos
ALTER TABLE "habitante_talento" ADD CONSTRAINT "habitante_talento_experiencia_no_negativa" CHECK ("anios_experiencia" >= 0);

-- Categorías y talentos iniciales
INSERT INTO "categoria_talento" ("nombre") VALUES
  ('Construcción'), ('Salud'), ('Educación'), ('Tecnología'), ('Artes'), ('Oficios del hogar');

INSERT INTO "talento" ("categoria_id", "nombre")
SELECT "id", 'Albañil' FROM "categoria_talento" WHERE "nombre" = 'Construcción'
UNION ALL
SELECT "id", 'Electricista' FROM "categoria_talento" WHERE "nombre" = 'Construcción'
UNION ALL
SELECT "id", 'Enfermero(a)' FROM "categoria_talento" WHERE "nombre" = 'Salud';
