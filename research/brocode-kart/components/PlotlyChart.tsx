"use client";

import { useState, useEffect } from "react";
import type { ComponentType } from "react";

let cachedPlotComponent: ComponentType<any> | null = null;

export function usePlotly() {
  const [Plot, setPlot] = useState<ComponentType<any> | null>(cachedPlotComponent);
  const [isLoading, setIsLoading] = useState(!cachedPlotComponent);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedPlotComponent) return;

    Promise.all([
      import("react-plotly.js/factory"),
      import("plotly.js-dist-min"),
    ])
      .then(([factoryMod, plotlyMod]) => {
        const createPlotlyComponent = factoryMod.default;
        const Plotly = plotlyMod.default;
        const PlotComponent = createPlotlyComponent(Plotly);
        cachedPlotComponent = PlotComponent;
        setPlot(() => PlotComponent);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load Plotly:", err);
        setError(true);
        setIsLoading(false);
      });
  }, []);

  return { Plot, isLoading, error };
}
