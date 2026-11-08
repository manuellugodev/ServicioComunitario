-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tipo_vivienda" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,

    CONSTRAINT "tipo_vivienda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_vivienda_nombre_key" ON "tipo_vivienda"("nombre");

-- Tipos iniciales
INSERT INTO "tipo_vivienda" ("nombre") VALUES ('Casa'), ('Apartamento'), ('Anexo'), ('Rancho'), ('Otro');
