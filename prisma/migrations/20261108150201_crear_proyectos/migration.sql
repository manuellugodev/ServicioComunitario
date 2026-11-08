-- CreateEnum
CREATE TYPE "estado_proyecto" AS ENUM ('PROPUESTO', 'EN_EJECUCION', 'PAUSADO', 'CULMINADO');

-- CreateTable
CREATE TABLE "proyecto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "responsable_id" INTEGER NOT NULL,
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "estado" "estado_proyecto" NOT NULL DEFAULT 'PROPUESTO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyecto_talento" (
    "proyecto_id" INTEGER NOT NULL,
    "talento_id" INTEGER NOT NULL,
    "cantidad_requerida" INTEGER NOT NULL,

    CONSTRAINT "proyecto_talento_pkey" PRIMARY KEY ("proyecto_id","talento_id")
);

-- CreateTable
CREATE TABLE "proyecto_participante" (
    "proyecto_id" INTEGER NOT NULL,
    "habitante_id" INTEGER NOT NULL,
    "talento_id" INTEGER NOT NULL,
    "rol" VARCHAR(80),
    "fecha_asignacion" DATE NOT NULL,

    CONSTRAINT "proyecto_participante_pkey" PRIMARY KEY ("proyecto_id","habitante_id","talento_id")
);

-- CreateIndex
CREATE INDEX "proyecto_responsable_id_idx" ON "proyecto"("responsable_id");

-- CreateIndex
CREATE INDEX "proyecto_talento_talento_id_idx" ON "proyecto_talento"("talento_id");

-- CreateIndex
CREATE INDEX "proyecto_participante_habitante_id_talento_id_idx" ON "proyecto_participante"("habitante_id", "talento_id");

-- CreateIndex
CREATE INDEX "proyecto_participante_proyecto_id_talento_id_idx" ON "proyecto_participante"("proyecto_id", "talento_id");

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_talento" ADD CONSTRAINT "proyecto_talento_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_talento" ADD CONSTRAINT "proyecto_talento_talento_id_fkey" FOREIGN KEY ("talento_id") REFERENCES "talento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_participante" ADD CONSTRAINT "proyecto_participante_proyecto_id_talento_id_fkey" FOREIGN KEY ("proyecto_id", "talento_id") REFERENCES "proyecto_talento"("proyecto_id", "talento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_participante" ADD CONSTRAINT "proyecto_participante_habitante_id_talento_id_fkey" FOREIGN KEY ("habitante_id", "talento_id") REFERENCES "habitante_talento"("habitante_id", "talento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Un proyecto debe requerir al menos una persona por talento
ALTER TABLE "proyecto_talento" ADD CONSTRAINT "proyecto_talento_cantidad_positiva" CHECK ("cantidad_requerida" > 0);
