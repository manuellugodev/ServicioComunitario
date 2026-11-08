-- CreateTable
CREATE TABLE "nucleo_familiar" (
    "id" SERIAL NOT NULL,
    "vivienda_id" INTEGER NOT NULL,
    "ingreso_aprox_usd" DECIMAL(10,2),
    "recibe_clap" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "nucleo_familiar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nucleo_familiar_vivienda_id_idx" ON "nucleo_familiar"("vivienda_id");

-- AddForeignKey
ALTER TABLE "nucleo_familiar" ADD CONSTRAINT "nucleo_familiar_vivienda_id_fkey" FOREIGN KEY ("vivienda_id") REFERENCES "vivienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nucleo_familiar" ADD CONSTRAINT "nucleo_familiar_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- El ingreso no puede ser negativo
ALTER TABLE "nucleo_familiar" ADD CONSTRAINT "nucleo_familiar_ingreso_no_negativo" CHECK ("ingreso_aprox_usd" >= 0);
