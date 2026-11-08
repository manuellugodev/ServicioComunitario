"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Colores validados contra daltonismo; siguen a la serie, no a su posición.
const COLOR_MUJERES = "#2a78d6";
const COLOR_HOMBRES = "#eb6834";
const COLOR_TALENTOS = "#2a78d6";
const ANCHO_INICIAL = 520;
const TEXTO_EJE = { fill: "var(--muted-foreground)", fontSize: 12 };

const ESTILO_TOOLTIP = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
};

type GrupoEdad = { grupo: string; mujeres: number; hombres: number };

function Leyenda() {
  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm" style={{ background: COLOR_HOMBRES }} />
        Hombres
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm" style={{ background: COLOR_MUJERES }} />
        Mujeres
      </span>
    </div>
  );
}

export function PiramidePoblacional({ datos }: { datos: GrupoEdad[] }) {
  const filas = datos.map(({ grupo, mujeres, hombres }) => ({ grupo, mujeres, hombres: -hombres }));
  const maximo = Math.max(1, ...datos.flatMap(({ mujeres, hombres }) => [mujeres, hombres]));
  const alto = datos.length * 22 + 40;

  return (
    <figure className="grid gap-3">
      <figcaption className="font-heading font-semibold">Pirámide poblacional</figcaption>
      <Leyenda />
      <div role="img" aria-label="Pirámide de población activa por grupo de edad y sexo">
        <ResponsiveContainer
          width="100%"
          height={alto}
          initialDimension={{ width: ANCHO_INICIAL, height: alto }}
        >
          <BarChart
            data={filas}
            layout="vertical"
            stackOffset="sign"
            barSize={16}
            margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              domain={[-maximo, maximo]}
              allowDecimals={false}
              tickFormatter={(valor: number) => String(Math.abs(valor))}
              tick={TEXTO_EJE}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="grupo"
              width={44}
              interval={0}
              tick={TEXTO_EJE}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={ESTILO_TOOLTIP}
              itemStyle={{ color: "var(--foreground)" }}
              labelFormatter={(grupo) => `${grupo} años`}
              formatter={(valor) => Math.abs(Number(valor))}
            />
            <Bar
              dataKey="hombres"
              name="Hombres"
              stackId="poblacion"
              fill={COLOR_HOMBRES}
              stroke="var(--background)"
              radius={[4, 0, 0, 4]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="mujeres"
              name="Mujeres"
              stackId="poblacion"
              fill={COLOR_MUJERES}
              stroke="var(--background)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Ver como tabla</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <thead>
            <tr className="border-b">
              <th className="py-1 font-medium">Edad</th>
              <th className="py-1 font-medium">Hombres</th>
              <th className="py-1 font-medium">Mujeres</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(({ grupo, mujeres, hombres }) => (
              <tr key={grupo} className="border-b">
                <td className="py-1">{grupo}</td>
                <td className="py-1">{hombres}</td>
                <td className="py-1">{mujeres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

type TalentoCategoria = { nombre: string; total: number };

export function TalentosPorCategoria({ datos }: { datos: TalentoCategoria[] }) {
  const alto = datos.length * 36 + 8;

  return (
    <figure className="grid gap-3">
      <figcaption className="font-heading font-semibold">Talentos por categoría</figcaption>
      <div role="img" aria-label="Cantidad de talentos registrados por categoría">
        <ResponsiveContainer
          width="100%"
          height={alto}
          initialDimension={{ width: ANCHO_INICIAL, height: alto }}
        >
          <BarChart
            data={datos}
            layout="vertical"
            barSize={20}
            margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="nombre"
              width={120}
              interval={0}
              tick={TEXTO_EJE}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={ESTILO_TOOLTIP}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(valor) => [String(valor), "Talentos"]}
            />
            <Bar dataKey="total" fill={COLOR_TALENTOS} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="total" position="right" fill="var(--foreground)" fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Ver como tabla</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <thead>
            <tr className="border-b">
              <th className="py-1 font-medium">Categoría</th>
              <th className="py-1 font-medium">Talentos</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(({ nombre, total }) => (
              <tr key={nombre} className="border-b">
                <td className="py-1">{nombre}</td>
                <td className="py-1">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
