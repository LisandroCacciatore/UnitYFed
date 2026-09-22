# UnitYFed V2 — Campañas y Combate

**Sandbox digital para prototipar un juego de mesa de campañas sobre un tablero de provincias: mapa SVG, nodos interactivos y combate con dados explosivos.**

Prototipo temprano. Existe para probar dos cosas antes de comprometer componentes físicos: cómo se siente la **campaña sobre el mapa** y cómo resuelve el **combate por márgenes**.

---

## Qué hay

- **Dos bandos:** Federal y Unitario.
- **Tablero:** mapa SVG por provincias con nodos interactivos. Cada provincia tiene unidades por bando y *tracks* que representan su inclinación.
- **Turnos:** el bando activo juega su mano; la ronda cierra con una fase de **mantenimiento**.
- **Cartas:** mano de 7, con efectos resueltos por el motor (robo de cartas, recursos).
- **Recursos:** cada bando acumula recursos propios (por ejemplo `fe`).
- **Combate:** pool de **dados d10 explosivos** — un 10 vuelve a tirar y suma. Los dados disponibles dependen del *track* de la provincia y de las unidades presentes. La diferencia entre atacante y defensor define el margen:

  | Diferencia | Resultado | Pasos |
  |---|---|---|
  | ≥ 10 | Victoria Decisiva | 3 |
  | ≥ 5 | Victoria Importante | 2 |
  | < 5 | Victoria Menor | 1 |

  El resultado mueve el track de la provincia.
- **Victoria:** se contabilizan las victorias de cada bando.

## Cómo correrlo

Sin build y sin dependencias instalables: se abre `index.html` en el navegador.

```bash
start index.html                    # Windows: abrir directo
python -m http.server 8000          # o servirlo en localhost:8000
```

## Estructura

`index.html` carga los módulos en orden de dependencia y deja `engine/game.js` para el final: ese archivo es el que arranca la partida.

| Ruta | Rol |
|---|---|
| `data/` | tokens, cartas, caudillos y mapa (provincias y nodos) |
| `engine/` | reglas: `province`, `combat`, `campaign`, `game` |
| `ui/` | render y paneles: `board`, `hand`, `log`, `panels` |
| `index.html` | entrada y orden de carga |
| `style.css` | estilos |

## Estado

Prototipo temprano. Puntos abiertos, verificados sobre el código actual:

- `data/caudillos.js` está **vacío** (`const CAUDILLOS = []`): la feature está en stub.
- En la raíz quedaron `cards.js`, `data.js`, `game.js` y `map.js` de una versión anterior. **`index.html` no los carga**: son huérfanos a retirar.
- No hay suite de tests ni build.

Para llevarlo al estándar del resto de los proyectos falta: aislar el arranque de la partida, incorporar Vitest y convertir en tests las funciones que ya son puras y deterministas (resolución de combate, márgenes y mantenimiento), que es donde está el valor de un prototipo de este tipo.
