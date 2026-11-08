-- CreateEnum
CREATE TYPE "sexo" AS ENUM ('F', 'M');

-- CreateEnum
CREATE TYPE "parentesco" AS ENUM ('JEFE', 'CONYUGE', 'HIJO', 'PADRE_MADRE', 'HERMANO', 'NIETO', 'OTRO');

-- CreateEnum
CREATE TYPE "nivel_educativo" AS ENUM ('SIN_ESCOLARIDAD', 'PRIMARIA', 'BACHILLERATO', 'TSU', 'UNIVERSITARIO', 'POSTGRADO');

-- CreateEnum
CREATE TYPE "estado_habitante" AS ENUM ('ACTIVO', 'MUDADO', 'FALLECIDO');

-- CreateTable
CREATE TABLE "habitante" (
    "id" SERIAL NOT NULL,
    "nucleo_id" INTEGER NOT NULL,
    "nacionalidad" CHAR(1) NOT NULL,
    "cedula" VARCHAR(12),
    "nombres" VARCHAR(80) NOT NULL,
    "apellidos" VARCHAR(80) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "sexo" "sexo" NOT NULL,
    "parentesco" "parentesco" NOT NULL,
    "telefono" VARCHAR(20),
    "correo" VARCHAR(120),
    "nivel_educativo" "nivel_educativo",
    "estudia_actualmente" BOOLEAN NOT NULL DEFAULT false,
    "ocupacion" VARCHAR(80),
    "discapacidad" VARCHAR(80),
    "enfermedad_cronica" VARCHAR(80),
    "estado" "estado_habitante" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "habitante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habitante_nucleo_id_idx" ON "habitante"("nucleo_id");

-- CreateIndex
CREATE UNIQUE INDEX "habitante_nacionalidad_cedula_key" ON "habitante"("nacionalidad", "cedula");

-- AddForeignKey
ALTER TABLE "habitante" ADD CONSTRAINT "habitante_nucleo_id_fkey" FOREIGN KEY ("nucleo_id") REFERENCES "nucleo_familiar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitante" ADD CONSTRAINT "habitante_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Un solo jefe activo por familia
CREATE UNIQUE INDEX "habitante_un_jefe_activo_por_nucleo" ON "habitante"("nucleo_id") WHERE "parentesco" = 'JEFE' AND "estado" = 'ACTIVO';

-- Solo nacionalidad V o E
ALTER TABLE "habitante" ADD CONSTRAINT "habitante_nacionalidad_valida" CHECK ("nacionalidad" IN ('V', 'E'));
