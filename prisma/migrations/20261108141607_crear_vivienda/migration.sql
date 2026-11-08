-- CreateEnum
CREATE TYPE "tenencia" AS ENUM ('PROPIA', 'ALQUILADA', 'PRESTADA', 'INVADIDA', 'OTRA');

-- CreateTable
CREATE TABLE "vivienda" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(15) NOT NULL,
    "sector_id" INTEGER NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "tipo_vivienda_id" INTEGER NOT NULL,
    "tenencia" "tenencia",
    "agua" BOOLEAN NOT NULL DEFAULT false,
    "electricidad" BOOLEAN NOT NULL DEFAULT false,
    "gas" BOOLEAN NOT NULL DEFAULT false,
    "aseo" BOOLEAN NOT NULL DEFAULT false,
    "internet" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "vivienda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vivienda_codigo_key" ON "vivienda"("codigo");

-- CreateIndex
CREATE INDEX "vivienda_sector_id_idx" ON "vivienda"("sector_id");

-- AddForeignKey
ALTER TABLE "vivienda" ADD CONSTRAINT "vivienda_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vivienda" ADD CONSTRAINT "vivienda_tipo_vivienda_id_fkey" FOREIGN KEY ("tipo_vivienda_id") REFERENCES "tipo_vivienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vivienda" ADD CONSTRAINT "vivienda_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
