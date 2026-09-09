WITH baseline AS (
 SELECT country, crop, AVG(production_kt) AS production_baseline,
        AVG(area_kha) AS area_baseline,
        AVG(production_kt / area_kha) AS yield_baseline
 FROM frozen_eurostat_cereal_records WHERE year BETWEEN 2015 AND 2017
 GROUP BY country, crop HAVING COUNT(*) = 3
)
SELECT r.country, r.crop, r.year,
       100.0 * (r.production_kt / b.production_baseline - 1) AS production_change_pct,
       100.0 * (r.area_kha / b.area_baseline - 1) AS area_change_pct,
       100.0 * ((r.production_kt / r.area_kha) / b.yield_baseline - 1) AS derived_yield_change_pct
FROM frozen_eurostat_cereal_records r
JOIN baseline b USING (country, crop)
WHERE r.year BETWEEN 2018 AND 2020
ORDER BY r.country, r.crop, r.year;
