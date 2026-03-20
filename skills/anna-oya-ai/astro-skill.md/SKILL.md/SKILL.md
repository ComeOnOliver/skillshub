---
name: astrology-assistant
description: Build and operate an AI astrology assistant that calculates birth charts, planetary positions, houses, and aspects using Swiss Ephemeris logic. Use when creating natal charts, birth chart calculators, astrology APIs, horoscope bots, or interpreting planetary positions.
---

# AI Astrology Assistant

Build an astrology assistant that computes birth charts with the same logic as professional tools (e.g. Astro-Seek). Use **Swiss Ephemeris** (or pyswisseph, swephR, swisseph-js) as the calculation engine.

## When to Apply This Skill

- User asks for birth chart calculation, natal chart, or horoscope by birth data
- Building an astrology API, chatbot, or web calculator
- Interpreting planetary positions, houses, or aspects
- Implementing ephemeris-based astrology features

---

## Core Workflow

```
1. Parse birth data (date, time, location) → validate inputs
2. Convert local time → UTC → Julian Day
3. Compute planetary positions (swe_calc_ut)
4. Compute houses, Ascendant, MC (swe_houses)
5. Assign planets to houses (swe_house_pos)
6. Calculate aspects between all pairs
7. Optionally apply sidereal ayanamsha
8. Format and interpret results
```

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| Date of birth | Yes | Day, month, year |
| Time | No* | Local time (h, m, s). *Required for houses/Ascendant |
| Birth place | Yes | City name or lat/long |
| Timezone | Yes | Auto from location or manual (e.g. UTC+1) |
| DST | Yes | Observed / Not-Observed |
| House system | No | Default: Placidus |
| Zodiac | No | Default: Tropical |

---

## Implementation Checklist

### 1. Time Conversion

```python
# Local → UTC (apply timezone + DST)
# UTC → Julian Day
jd_ut = swe_utc_to_jd(year, month, day, hour, min, sec, SE_GREG_CAL)
# Returns: dret[0]=JD_TT, dret[1]=JD_UT
```

### 2. Planetary Positions

```python
# For each body: Sun(0), Moon(1), Mercury(2)... Pluto(9), Node(10/11), Chiron(12), Lilith(15)
ret, xx = swe_calc_ut(jd_ut, planet_id, SEFLG_SWIEPH)
# xx[0]=longitude, xx[1]=latitude, xx[2]=distance, xx[3]=speed (retrograde if < 0)
```

### 3. Houses

```python
# Requires: jd_ut, latitude, longitude, house_system
cusps, ascmc = swe_houses(jd_ut, lat, lon, hsys)
# cusps[1..12] = house cusps, ascmc[0]=Ascendant, ascmc[1]=MC
```

### 4. House Assignment

```python
house = swe_house_pos(armc, lat, obliquity, hsys, [lon, lat])
```

### 5. Aspects

Compute angular distance between each planet pair. Aspect is valid if `|distance - aspect_angle| <= orb`.

| Aspect | Angle | Default orb |
|--------|-------|-------------|
| Conjunction | 0° | 8° |
| Opposition | 180° | 7° |
| Trine | 120° | 6° |
| Square | 90° | 6° |
| Sextile | 60° | 4° |

### 6. Sidereal (Optional)

```python
swe_set_sid_mode(ayanamsha_type)  # e.g. SE_SIDM_LAHIRI
# Then swe_calc_ut returns sidereal positions
# Or: sidereal_lon = tropical_lon - swe_get_ayanamsa_ut(jd_ut)
```

---

## Output Format

Present results as:

1. **Planet table**: Planet | Sign | Degree | House | Retrograde
2. **House cusps**: ASC, MC, and houses 1–12
3. **Aspects list**: Planet A – Aspect – Planet B (orb)
4. **Special points**: Part of Fortune, Vertex, Nodes, Lilith (if enabled)

---

## Key Constants

- **Planet IDs**: Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9, MeanNode=10, TrueNode=11, Chiron=12, MeanLilith=15
- **House systems**: P=Placidus, K=Koch, R=Regiomontanus, C=Campanus, E=Equal, W=Whole Sign
- **Zodiac signs**: 0°=Aries, 30°=Taurus, 60°=Gemini... 330°=Pisces

---

## Part of Fortune

```
Diurnal (Sun above horizon): Fortune = ASC + Moon - Sun
Nocturnal (Sun below horizon): Fortune = ASC + Sun - Moon
```

---

## Error Handling

- **Unknown birth time**: Compute chart without houses; use noon or offer "chart for date only"
- **Invalid coordinates**: Reject or use fallback (e.g. capital city)
- **Polar latitudes**: Placidus fails; suggest Equal or Whole Sign
- **Date out of range**: Swiss Ephemeris covers ~13,000 years; validate 1800–2100 for typical use

---

## Dependencies

- **Python**: `pyswisseph` + ephemeris files (download from astro.com)
- **Node.js**: `swisseph` or `astronomia`
- **R**: `swephR`

Set ephemeris path: `swe_set_ephe_path("/path/to/ephe")`

---

## Reference & Examples

- **Full API specs, formulas, ayanamshas:** [reference.md](reference.md)
- **User flows, response formats, edge cases:** [examples.md](examples.md)
