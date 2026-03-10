export interface SSBStats {
    source: string;
    updated: string;
    market_overview: {
        total_grocery_turnover_2024: number;
        growth_rate: number;
        market_shares: {
            discount: number;
            supermarket: number;
            convenience: number;
        };
        private_label_share: number;
    };
    production: {
        meat_tonnes_2023: {
            pork: number;
            poultry: number;
            beef: number;
        };
        self_sufficiency_2023: {
            calories: number;
            calories_corrected_for_feed: number;
            milk: number;
            meat: number;
            potatoes: number;
            vegetables: number;
            fruit: number;
        };
    };
    logistics: {
        freight_road_food_share_eu: number;
    };
    economics: {
        operating_margin_grocery: number;
        border_trade_2023_nok: number;
        cpi_food_oct24_oct25: number;
    };
}

export interface FinancialStats {
    reporting_year: string;
    corporate_results: Record<string, {
        revenue_nok_bn: number;
        net_profit_nok_bn?: number;
        operating_profit_nok_bn?: number;
        profit_before_tax_nok_m?: number;
        profit_margin_percent?: number;
        operating_margin_percent?: number;
        result_margin_percent?: number;
        retail_segment_margin?: number;
        key_drivers: string[];
    }>;
    value_chain_margins_study_2024: {
        source: string;
        findings: {
            supplier_level: string;
            retail_level: string;
            pandemic_effect: string;
            ukraine_war_effect: string;
        };
    };
    external_analysis: Record<string, string>;
}

export interface TradeStats {
    updated: string;
    domestic_production: {
        grain_tonnes: number;
        meat_total_tonnes: number;
        meat_breakdown: {
            pork: number;
            poultry: number;
            beef: number;
            sheep_lamb: number;
            reindeer: number;
        };
        milk_tonnes: number;
        fruit_veg_tonnes: number;
    };
    imports: {
        total_value_nok_bn: number;
        fruit_veg_tonnes: number;
        cheese_tonnes: number;
        meat_tonnes: number;
    };
    exports: {
        seafood_total_tonnes: number;
        seafood_value_nok_bn: number;
        breakdown: {
            aquaculture_tonnes: number;
            fisheries_tonnes: number;
        };
    };
    market_balance: {
        fruit_veg_domestic_share_percent: number;
        meat_import_dependency_percent: number;
    };
}

export interface FoodSystemInsights {
    ssb: SSBStats;
    financials: FinancialStats;
    trade: TradeStats;
}
