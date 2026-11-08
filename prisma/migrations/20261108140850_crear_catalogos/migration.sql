-- AlterTable
ALTER TABLE "tipo_vivienda" ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(80);

-- CreateTable
CREATE TABLE "sector" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,

    CONSTRAINT "sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre_consejo" VARCHAR(120) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sector_nombre_key" ON "sector"("nombre");

-- Nombre inicial del consejo comunal
INSERT INTO "configuracion" ("nombre_consejo") VALUES ('Consejo Comunal Alto Barinas Norte');
