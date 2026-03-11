"""
Norwegian Food System Visualization Suite
Generates 5 publication-quality figures for the NCH whitepaper.
All figures: 300dpi, PNG + PDF, consistent minimal theme.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import json
import os

FIGDIR = os.path.join(os.path.dirname(__file__), '..', 'figurer')
os.makedirs(FIGDIR, exist_ok=True)

COLORS = {
    'kpi': '#2563eb',
    'ppi': '#dc2626',
    'spread': '#9333ea',
    'norgesgruppen': '#1e40af',
    'coop': '#b91c1c',
    'reitan': '#ca8a04',
    'bunnpris': '#059669',
    'other': '#6b7280',
    'bg': '#ffffff',
    'grid': '#e5e7eb',
    'text': '#111827',
}

FONT = {'family': 'sans-serif', 'size': 10}
matplotlib.rc('font', **FONT)
matplotlib.rc('axes', labelcolor=COLORS['text'], edgecolor=COLORS['grid'])
matplotlib.rc('xtick', color=COLORS['text'])
matplotlib.rc('ytick', color=COLORS['text'])

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
RESEARCH_DIR = os.path.join(os.path.dirname(__file__), '..', '..')


def save(fig, name):
    for fmt in ['png', 'pdf']:
        path = os.path.join(FIGDIR, f'{name}.{fmt}')
        fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'  Saved: {name}.png / .pdf')


# ──────────────────────────────────────────────
# Figure 1: Price Transmission Gap
# ──────────────────────────────────────────────
def fig1_price_transmission():
    print('Fig 1: Price Transmission Gap')
    df = pd.read_csv(os.path.join(DATA_DIR, 'prisindekser-2015-2026.csv'))
    df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m')
    year_range = f"{df['Date'].dt.year.min()}–{df['Date'].dt.year.max()}"

    fig, ax = plt.subplots(figsize=(10, 5))

    ax.plot(df['Date'], df['KPI_Indexed'], color=COLORS['kpi'], linewidth=1.5, label='KPI (consumer prices)')
    ax.plot(df['Date'], df['PPI_Indexed'], color=COLORS['ppi'], linewidth=1.5, label='PPI (producer prices)')
    ax.fill_between(df['Date'], df['KPI_Indexed'], df['PPI_Indexed'],
                     where=df['PPI_Indexed'] > df['KPI_Indexed'],
                     alpha=0.15, color=COLORS['ppi'], label='Producer absorbs more')
    ax.fill_between(df['Date'], df['KPI_Indexed'], df['PPI_Indexed'],
                     where=df['KPI_Indexed'] >= df['PPI_Indexed'],
                     alpha=0.15, color=COLORS['kpi'], label='Consumer pays more')

    ax.axhline(100, color=COLORS['grid'], linestyle='--', linewidth=0.7)
    ax.axvline(pd.Timestamp('2020-01-01'), color=COLORS['grid'], linestyle=':', linewidth=0.7)
    ax.text(pd.Timestamp('2020-02-01'), 138, 'Base: Jan 2020 = 100', fontsize=7, color=COLORS['text'])

    ax.set_ylabel('Index (Jan 2020 = 100)')
    ax.set_title(f'Price Transmission Gap: Consumer vs Producer Prices ({year_range})',
                 fontsize=12, fontweight='bold', pad=12)
    ax.legend(loc='upper left', frameon=False, fontsize=8)
    ax.set_xlim(df['Date'].min(), df['Date'].max())
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('%.0f'))
    ax.grid(axis='y', color=COLORS['grid'], linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.text(0.99, 0.01, 'Source: SSB Tables 14700, 03013 (archive bridge), 12462', ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig1_price_transmission_gap')


# ──────────────────────────────────────────────
# Figure 2: Market Concentration Treemap
# ──────────────────────────────────────────────
def fig2_treemap():
    print('Fig 2: Market Concentration Treemap')
    import squarify

    with open(os.path.join(DATA_DIR, 'markedskonsentrasjon-resultater.json')) as f:
        data = json.load(f)

    parents = data['concentration']['parents']
    labels = []
    sizes = []
    colors = []
    color_map = {
        'NorgesGruppen': COLORS['norgesgruppen'],
        'Coop Norge': COLORS['coop'],
        'Reitangruppen': COLORS['reitan'],
        'Bunnpris AS': COLORS['bunnpris'],
        'Other': COLORS['other'],
    }
    for p in parents:
        labels.append(f"{p['parent']}\n{p['share']:.1f}%\n({p['count']} stores)")
        sizes.append(p['share'])
        colors.append(color_map.get(p['parent'], COLORS['other']))

    fig, ax = plt.subplots(figsize=(10, 6))
    squarify.plot(sizes=sizes, label=labels, color=colors, alpha=0.85, ax=ax,
                  text_kwargs={'fontsize': 10, 'fontweight': 'bold', 'color': 'white'})
    ax.set_title('Norwegian Grocery Market: Parent Company Concentration\nHHI = 3,438 | Top-3 = 93.4%',
                 fontsize=12, fontweight='bold', pad=12)
    ax.axis('off')
    fig.text(0.99, 0.01, 'Source: OSM store data (3,849 stores), Dec 2025', ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig2_market_concentration_treemap')


# ──────────────────────────────────────────────
# Figure 3: Lorenz Curve with Gini
# ──────────────────────────────────────────────
def fig3_lorenz():
    print('Fig 3: Lorenz Curve')
    with open(os.path.join(DATA_DIR, 'markedskonsentrasjon-resultater.json')) as f:
        data = json.load(f)

    chains = sorted(data['concentration']['chains'], key=lambda x: x['count'])
    stores = np.array([c['count'] for c in chains])
    cum_stores = np.cumsum(stores) / stores.sum()
    cum_chains = np.arange(1, len(stores) + 1) / len(stores)

    cum_stores = np.insert(cum_stores, 0, 0)
    cum_chains = np.insert(cum_chains, 0, 0)

    gini = data['concentration']['gini']

    fig, ax = plt.subplots(figsize=(7, 7))
    ax.plot([0, 1], [0, 1], 'k--', linewidth=0.8, label='Perfect equality')
    ax.plot(cum_chains, cum_stores, color=COLORS['kpi'], linewidth=2, label=f'Chain distribution (Gini = {gini:.3f})')
    ax.fill_between(cum_chains, cum_chains, cum_stores, alpha=0.12, color=COLORS['kpi'])

    ax.set_xlabel('Cumulative share of chains (ranked by store count)')
    ax.set_ylabel('Cumulative share of stores')
    ax.set_title('Lorenz Curve: Store Distribution Inequality Among Chains',
                 fontsize=12, fontweight='bold', pad=12)
    ax.legend(loc='upper left', frameon=False, fontsize=9)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect('equal')
    ax.grid(color=COLORS['grid'], linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.text(0.99, 0.01, 'Source: OSM store data (14 chains, 3,849 stores)', ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig3_lorenz_curve_gini')


# ──────────────────────────────────────────────
# Figure 4: Zipf Distribution (log-log)
# ──────────────────────────────────────────────
def fig4_zipf():
    print('Fig 4: Zipf Distribution')
    with open(os.path.join(DATA_DIR, 'markedskonsentrasjon-resultater.json')) as f:
        data = json.load(f)

    pop = data['zipf_population']
    top10 = pop['top_10']
    ranks = np.arange(1, pop['n_municipalities'] + 1)
    predicted = np.exp(pop['intercept'] + pop['slope'] * np.log(ranks))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # Panel A: Municipality population
    with open(os.path.join(os.path.dirname(__file__), '..', '..', 'brocode-kart', 'data', 'municipalities.json')) as f:
        muni_data = json.load(f)
    pop_sorted = sorted([v['population'] for v in muni_data.values() if v.get('population')], reverse=True)
    actual_ranks = np.arange(1, len(pop_sorted) + 1)

    ax1.scatter(actual_ranks, pop_sorted, s=8, alpha=0.4, color=COLORS['kpi'], label='Actual')
    ax1.plot(ranks[:len(predicted)], predicted, color=COLORS['ppi'], linewidth=1.5,
             label=f'Zipf fit (slope={pop["slope"]:.2f}, R²={pop["r_squared"]:.3f})')
    ax1.set_xscale('log')
    ax1.set_yscale('log')
    ax1.set_xlabel('Rank')
    ax1.set_ylabel('Population')
    ax1.set_title('A. Municipality Population', fontsize=11, fontweight='bold')
    ax1.legend(frameon=False, fontsize=8)
    ax1.grid(color=COLORS['grid'], linewidth=0.5, which='both')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Panel B: Chain store count
    chain_data = data['zipf_chains']['chain_distribution']
    chain_ranks = np.array([c['rank'] for c in chain_data])
    chain_stores = np.array([c['stores'] for c in chain_data])
    chain_predicted = np.exp(data['zipf_chains']['intercept'] + data['zipf_chains']['slope'] * np.log(chain_ranks))

    ax2.scatter(chain_ranks, chain_stores, s=40, color=COLORS['reitan'], zorder=5, label='Actual')
    ax2.plot(chain_ranks, chain_predicted, color=COLORS['ppi'], linewidth=1.5,
             label=f'Zipf fit (slope={data["zipf_chains"]["slope"]:.2f}, R²={data["zipf_chains"]["r_squared"]:.3f})')
    for i, c in enumerate(chain_data[:5]):
        ax2.annotate(c['chain'], (c['rank'], c['stores']), textcoords='offset points',
                     xytext=(8, 4), fontsize=7)
    ax2.set_xscale('log')
    ax2.set_yscale('log')
    ax2.set_xlabel('Rank')
    ax2.set_ylabel('Store count')
    ax2.set_title('B. Chain Store Distribution', fontsize=11, fontweight='bold')
    ax2.legend(frameon=False, fontsize=8)
    ax2.grid(color=COLORS['grid'], linewidth=0.5, which='both')
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    fig.suptitle('Zipf Distribution Analysis: Population and Store Counts',
                 fontsize=13, fontweight='bold', y=1.02)
    fig.tight_layout()
    fig.text(0.99, -0.02, 'Source: SSB (population), OSM (stores)', ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig4_zipf_distribution')


# ──────────────────────────────────────────────
# Figure 5: PPI-KPI Spread Timeline
# ──────────────────────────────────────────────
def fig5_spread():
    print('Fig 5: PPI-KPI Spread Timeline')
    df = pd.read_csv(os.path.join(DATA_DIR, 'prisindekser-2015-2026.csv'))
    df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m')
    year_range = f"{df['Date'].dt.year.min()}–{df['Date'].dt.year.max()}"

    fig, ax = plt.subplots(figsize=(10, 5))

    colors_bar = [COLORS['kpi'] if s >= 0 else COLORS['ppi'] for s in df['Spread']]
    ax.bar(df['Date'], df['Spread'], width=25, color=colors_bar, alpha=0.7)
    ax.axhline(0, color=COLORS['text'], linewidth=0.8)

    window = 6
    rolling = df['Spread'].rolling(window=window, center=True).mean()
    ax.plot(df['Date'], rolling, color=COLORS['spread'], linewidth=2, label=f'{window}-month moving average')

    worst_gap = df.loc[df['Spread'].idxmin()]
    latest = df.iloc[-1]

    ax.annotate(
        f"{worst_gap['Date'].strftime('%b %Y')}\nWorst gap: {worst_gap['Spread']:.1f}",
        xy=(worst_gap['Date'], worst_gap['Spread']),
        xytext=(worst_gap['Date'] - pd.DateOffset(months=20), worst_gap['Spread'] - 4),
        arrowprops=dict(arrowstyle='->', color=COLORS['text'], lw=0.8),
        fontsize=7,
        ha='center',
    )

    ax.annotate(
        f"{latest['Date'].strftime('%b %Y')}\nLatest: {latest['Spread']:.1f}",
        xy=(latest['Date'], latest['Spread']),
        xytext=(latest['Date'] - pd.DateOffset(months=10), latest['Spread'] - 12),
        arrowprops=dict(arrowstyle='->', color=COLORS['text'], lw=0.8),
        fontsize=7,
        ha='center',
    )

    ax.set_ylabel('Spread (KPI − PPI, index points)')
    ax.set_title(f'Producer-Consumer Price Spread: Margin Dynamics ({year_range})',
                 fontsize=12, fontweight='bold', pad=12)
    ax.legend(loc='lower left', frameon=False, fontsize=8)
    ax.set_xlim(df['Date'].min(), df['Date'].max())
    ax.grid(axis='y', color=COLORS['grid'], linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Phase annotations
    phases = [
        ('2015-01', '2019-12', 'Pre-crisis\nequilibrium', 3),
        ('2020-01', '2020-12', 'Pandemic', 3),
        ('2021-01', '2021-12', 'Divergence\nbegins', -2),
        ('2022-01', '2023-06', 'Maximum\ngap', -2),
        ('2023-07', df['Date'].max().strftime('%Y-%m'), 'Partial\nconvergence', -2),
    ]
    for start, end, label, y_pos in phases:
        mid = pd.Timestamp(start) + (pd.Timestamp(end) - pd.Timestamp(start)) / 2
        ax.text(mid, y_pos, label, fontsize=6, ha='center', va='center',
                color='#6b7280', fontstyle='italic')

    fig.text(0.99, 0.01, 'Source: SSB Tables 14700, 03013 (archive bridge), 12462', ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig5_ppi_kpi_spread_timeline')


if __name__ == '__main__':
    print('Generating Norwegian Food System Figures...\n')
    failures = []
    for label, figure_fn in [
        ('fig1_price_transmission', fig1_price_transmission),
        ('fig2_treemap', fig2_treemap),
        ('fig3_lorenz', fig3_lorenz),
        ('fig4_zipf', fig4_zipf),
        ('fig5_spread', fig5_spread),
    ]:
        try:
            figure_fn()
        except ModuleNotFoundError as exc:
            failures.append((label, exc.name))
            print(f'  Skipped {label}: missing optional dependency {exc.name}')

    if failures:
        print('\nFigure generation completed with skipped steps.')
    else:
        print('\nAll figures generated successfully.')
