"""
Nordic Comparative Visualization Suite
Generates 4 publication-quality figures comparing NO, DK, SE, FI.
All figures: 300dpi, PNG + PDF, consistent minimal theme.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os

FIGDIR = os.path.join(os.path.dirname(__file__), '..', 'figurer')
os.makedirs(FIGDIR, exist_ok=True)

COLORS = {
    'norway': '#ba0c2f',
    'denmark': '#c8102e',
    'sweden': '#006aa7',
    'finland': '#003580',
    'bg': '#ffffff',
    'grid': '#e5e7eb',
    'text': '#111827',
}
COUNTRY_COLORS = [COLORS['norway'], COLORS['denmark'], COLORS['sweden'], COLORS['finland']]
COUNTRIES = ['Norway', 'Denmark', 'Sweden', 'Finland']

FONT = {'family': 'sans-serif', 'size': 10}
matplotlib.rc('font', **FONT)
matplotlib.rc('axes', labelcolor=COLORS['text'], edgecolor=COLORS['grid'])
matplotlib.rc('xtick', color=COLORS['text'])
matplotlib.rc('ytick', color=COLORS['text'])


def save(fig, name):
    for fmt in ['png', 'pdf']:
        path = os.path.join(FIGDIR, f'{name}.{fmt}')
        fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'  Saved: {name}.png / .pdf')


# ──────────────────────────────────────────────
# Figure 6: Nordic HHI Comparison
# ──────────────────────────────────────────────
def fig6_hhi():
    print('Fig 6: Nordic HHI Comparison')
    hhis = [3438, 2500, 3300, 3600]

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(COUNTRIES, hhis, color=COUNTRY_COLORS, width=0.6, alpha=0.85)
    ax.axhline(2500, color='#ef4444', linestyle='--', linewidth=1, label='DOJ/FTC "highly concentrated" threshold (2,500)')
    ax.axhline(1500, color='#f59e0b', linestyle='--', linewidth=1, label='DOJ/FTC "moderately concentrated" threshold (1,500)')

    for bar, val in zip(bars, hhis):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 50,
                f'{val:,}', ha='center', va='bottom', fontweight='bold', fontsize=11)

    ax.set_ylabel('Herfindahl-Hirschman Index (HHI)')
    ax.set_title('Nordic Grocery Market Concentration (HHI)\nParent/Group Level, 2024',
                 fontsize=12, fontweight='bold', pad=12)
    ax.set_ylim(0, 4500)
    ax.legend(loc='upper right', frameon=False, fontsize=8)
    ax.grid(axis='y', color=COLORS['grid'], linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.text(0.99, 0.01, 'Sources: Konkurransetilsynet, NHH FOOD, Konkurrensverket, KKV',
             ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig6_nordic_hhi_comparison')


# ──────────────────────────────────────────────
# Figure 7: Nordic Concentration — Stacked Top-3
# ──────────────────────────────────────────────
def fig7_concentration():
    print('Fig 7: Nordic Concentration Comparison')

    data = {
        'Norway': {'#1 NorgesGruppen': 44, '#2 Coop Norge': 29, '#3 Rema 1000': 24, 'Others': 3},
        'Denmark': {'#1 Salling Group': 35, '#2 Coop Danmark': 29, '#3 Rema 1000': 14, 'Others': 22},
        'Sweden': {'#1 ICA Gruppen': 50, '#2 Axfood': 25, '#3 Coop Sverige': 14, 'Others': 11},
        'Finland': {'#1 S Group': 49, '#2 K Group': 34, '#3 Lidl': 9, 'Others': 8},
    }

    colors_seg = ['#1e40af', '#2563eb', '#60a5fa', '#d1d5db']

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(COUNTRIES))
    width = 0.6
    bottom = np.zeros(4)

    segment_labels = ['#1 Player', '#2 Player', '#3 Player', 'Others']
    for i, label in enumerate(segment_labels):
        vals = [list(data[c].values())[i] for c in COUNTRIES]
        bars = ax.bar(x, vals, width, bottom=bottom, color=colors_seg[i], label=label, alpha=0.85)
        for j, (v, b) in enumerate(zip(vals, bottom)):
            if v >= 8:
                player_name = list(data[COUNTRIES[j]].keys())[i].split(' ', 1)[1] if i < 3 else 'Others'
                ax.text(x[j], b + v / 2, f'{player_name}\n{v}%',
                        ha='center', va='center', fontsize=7, fontweight='bold', color='white' if i < 3 else '#374151')
        bottom += vals

    for j, c in enumerate(COUNTRIES):
        top3 = sum(list(data[c].values())[:3])
        ax.text(x[j], 102, f'Top-3: {top3}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax.set_xticks(x)
    ax.set_xticklabels(COUNTRIES, fontweight='bold')
    ax.set_ylabel('Market Share (%)')
    ax.set_title('Nordic Grocery Market: Top-3 Player Concentration\nEstimated Revenue-Based Market Shares, 2024',
                 fontsize=12, fontweight='bold', pad=12)
    ax.set_ylim(0, 115)
    ax.legend(loc='upper right', frameon=False, fontsize=8)
    ax.grid(axis='y', color=COLORS['grid'], linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.text(0.99, 0.01, 'Sources: Konkurransetilsynet, NHH FOOD, Statista, KKV/PTY',
             ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig7_nordic_concentration_comparison')


# ──────────────────────────────────────────────
# Figure 8: Self-Sufficiency Rates
# ──────────────────────────────────────────────
def fig8_selfsufficiency():
    print('Fig 8: Self-Sufficiency Rates')

    categories = ['Total\ncalories', 'Meat', 'Dairy/Milk', 'Grain', 'Fruit &\nVegetables']
    norway = [44, 96, 98, 40, 27]
    denmark = [300, 300, 150, 120, 40]
    sweden = [50, 70, 95, 80, 30]
    finland = [80, 82, 100, 112, 35]

    fig, axes = plt.subplots(1, 2, figsize=(14, 5), gridspec_kw={'width_ratios': [1, 2]})

    # Panel A: Overall caloric self-sufficiency
    ax1 = axes[0]
    overall = [44, 300, 50, 80]
    overall_display = [44, 150, 50, 80]  # Cap Denmark for display
    bars = ax1.barh(COUNTRIES, overall_display, color=COUNTRY_COLORS, alpha=0.85, height=0.5)
    ax1.axvline(100, color='#ef4444', linestyle='--', linewidth=1, label='Self-sufficient (100%)')
    for i, (bar, val) in enumerate(zip(bars, overall)):
        label = f'{val}%' if val <= 150 else '~300%'
        ax1.text(min(bar.get_width(), 150) + 2, bar.get_y() + bar.get_height() / 2,
                 label, va='center', fontweight='bold', fontsize=10)
    ax1.set_xlabel('Caloric self-sufficiency (%)')
    ax1.set_title('A. Overall Self-Sufficiency', fontsize=11, fontweight='bold')
    ax1.set_xlim(0, 165)
    ax1.legend(frameon=False, fontsize=8, loc='lower right')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.grid(axis='x', color=COLORS['grid'], linewidth=0.5)

    # Panel B: By category
    ax2 = axes[1]
    x = np.arange(len(categories))
    w = 0.18
    offsets = [-1.5, -0.5, 0.5, 1.5]

    # Cap Denmark values for display
    dk_display = [min(v, 200) for v in denmark]

    for i, (vals, vals_display, name) in enumerate([
        (norway, norway, 'Norway'),
        (denmark, dk_display, 'Denmark'),
        (sweden, sweden, 'Sweden'),
        (finland, finland, 'Finland')
    ]):
        bars = ax2.bar(x + offsets[i] * w, vals_display, w, color=COUNTRY_COLORS[i],
                        label=name, alpha=0.85)
        for j, (bar, v) in enumerate(zip(bars, vals)):
            if v > 200:
                ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2,
                         f'{v}%', ha='center', va='bottom', fontsize=6, rotation=90)

    ax2.axhline(100, color='#ef4444', linestyle='--', linewidth=0.8)
    ax2.set_xticks(x)
    ax2.set_xticklabels(categories, fontsize=9)
    ax2.set_ylabel('Self-sufficiency (%)')
    ax2.set_title('B. By Category', fontsize=11, fontweight='bold')
    ax2.set_ylim(0, 220)
    ax2.legend(frameon=False, fontsize=8, ncol=4, loc='upper right')
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)
    ax2.grid(axis='y', color=COLORS['grid'], linewidth=0.5)

    fig.suptitle('Nordic Food Self-Sufficiency Rates (2023–2024)',
                 fontsize=13, fontweight='bold', y=1.02)
    fig.tight_layout()
    fig.text(0.99, -0.02, 'Sources: SSB, Luke.fi, SCB, DST, Landbruksdirektoratet',
             ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig8_self_sufficiency_rates')


# ──────────────────────────────────────────────
# Figure 9: Regulatory Intervention Heatmap
# ──────────────────────────────────────────────
def fig9_regulatory():
    print('Fig 9: Regulatory Heatmap')

    tools = [
        'Auto dominance threshold',
        'Grocery-specific UTP law',
        'UTP enforcement (decisions)',
        'Market investigation powers',
        'Active merger control',
        'Price/margin surveillance',
        'Self-sufficiency targets',
        'Emergency food stockpiling',
        'Food waste reduction law',
        'Mandatory climate labeling',
    ]

    # Score: 0 = absent, 1 = weak/planned, 2 = moderate, 3 = strong
    matrix = np.array([
        [0, 0, 0, 3],  # Auto dominance
        [3, 2, 2, 3],  # Grocery UTP
        [0, 1, 2, 2],  # UTP enforcement
        [3, 2, 2, 2],  # Market investigation
        [2, 3, 2, 2],  # Merger control
        [3, 2, 3, 3],  # Price surveillance
        [3, 0, 1, 2],  # Self-sufficiency
        [2, 0, 1, 3],  # Stockpiling
        [1, 1, 1, 1],  # Food waste law
        [0, 3, 0, 0],  # Climate label
    ])

    fig, ax = plt.subplots(figsize=(8, 7))
    cmap = plt.cm.RdYlGn
    im = ax.imshow(matrix, cmap=cmap, aspect='auto', vmin=0, vmax=3)

    ax.set_xticks(range(4))
    ax.set_xticklabels(COUNTRIES, fontweight='bold', fontsize=10)
    ax.set_yticks(range(len(tools)))
    ax.set_yticklabels(tools, fontsize=9)

    ax.xaxis.set_ticks_position('top')
    ax.xaxis.set_label_position('top')

    labels = {0: 'Absent', 1: 'Weak', 2: 'Moderate', 3: 'Strong'}
    for i in range(len(tools)):
        for j in range(4):
            val = matrix[i, j]
            color = 'white' if val >= 2 else COLORS['text']
            ax.text(j, i, labels[val], ha='center', va='center', fontsize=8, color=color, fontweight='bold')

    ax.set_title('Nordic Regulatory Intervention Heatmap\nFood System Policy Tools by Country',
                 fontsize=12, fontweight='bold', pad=20)

    cbar = fig.colorbar(im, ax=ax, shrink=0.6, pad=0.02)
    cbar.set_ticks([0, 1, 2, 3])
    cbar.set_ticklabels(['Absent', 'Weak', 'Moderate', 'Strong'])

    fig.text(0.99, 0.01, 'Assessment: NCH research team, March 2026',
             ha='right', fontsize=7, color='#9ca3af')
    save(fig, 'fig9_regulatory_heatmap')


if __name__ == '__main__':
    print('Generating Nordic Comparative Figures...\n')
    fig6_hhi()
    fig7_concentration()
    fig8_selfsufficiency()
    fig9_regulatory()
    print('\nAll figures generated successfully.')
