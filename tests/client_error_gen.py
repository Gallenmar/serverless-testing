import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

data_sources = {
    'Lambda': {'file': 'new_results/1000_10_wdb_lambda_us_wait_client.csv', 'color': '#ff9933'},
    'EC2': {'file': 'results/1000_10_wdb_ec2.csv', 'color': '#3498db'}
}
title = "Augstas slodzes tests ar datubāzi - Lambda vs EC2"

plt.figure(figsize=(10, 6))

all_durations = []
source_durations = {}

plt.xscale('log')

def generate_grid_lines(min_val, max_val):
    min_exp = np.floor(np.log10(min_val))
    max_exp = np.ceil(np.log10(max_val))
    
    grid_lines = []
    for exp in range(int(min_exp), int(max_exp + 1)):
        base = 10 ** exp
        grid_lines.extend([base * x for x in [1, 2, 5]])
    
    return [x for x in grid_lines if min_val <= x <= max_val]

for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path)
    
    if name == "Lambda":
        duration_values = df["cumulative_duration"] / 1000
        duration_data = df
    else:
        duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
        duration_values = duration_data["metric_value"].values / 1000
    
    error_codes = duration_data["error_code"].notna().values
    sorted_indices = np.argsort(duration_values)
    error_codes = error_codes[sorted_indices]
    
    all_durations.extend(duration_values)
    source_durations[name] = {
        'values': duration_values,
        'mean': np.mean(duration_values)
    }
    
    sorted_durations = np.sort(duration_values)
    cumulative_prob = np.arange(1, len(sorted_durations) + 1) / len(sorted_durations)
    
    plt.plot(sorted_durations, cumulative_prob, '-', linewidth=2, color=source['color'], label=name, zorder=2)
    
    print(f"\n{name} Statistika:")
    print(f"Vidējais ilgums: {np.mean(duration_values):.3f} s")
    print(f"Mediāna: {np.median(duration_values):.3f} s")
    print(f"95. percentilis: {np.percentile(duration_values, 95):.3f} s")
    print(f"99. percentilis: {np.percentile(duration_values, 99):.3f} s")

grid_lines_s = generate_grid_lines(min(all_durations), max(all_durations))
plt.vlines(grid_lines_s, 0, 1, colors='lightgrey', linestyles='-', alpha=0.5, zorder=1)

percentiles = [0, 0.25, 0.50, 0.75, 0.90, 0.95, 1]
plt.hlines(percentiles, min(all_durations), max(all_durations), colors='lightgrey', linestyles='-', alpha=0.5, zorder=1)

plt.grid(False)

plt.xlabel('HTTP pieprasījuma ilgums (s)')
plt.ylabel('Kumulatīvā varbūtība')
plt.title(title)

x_ticks = set()
x_labels = {}

for name, durations in source_durations.items():
    min_val = min(durations['values'])
    max_val = max(durations['values'])
    x_ticks.add(min_val)
    x_ticks.add(max_val)
    x_labels[min_val] = f'{name} min\n{min_val:.3f}'
    x_labels[max_val] = f'{name} max\n{max_val:.3f}'

for val in grid_lines_s:
    x_ticks.add(val)
    x_labels[val] = f'{val:.3f}'

x_ticks = sorted(list(x_ticks))
x_tick_labels = [x_labels[x] for x in x_ticks]

plt.xticks(x_ticks, x_tick_labels, rotation=45)

plt.yticks(percentiles, ['0%', '25%', '50%', '75%', '90%', '95%', '100%'])

plt.legend(loc='lower right')

plt.tight_layout()

plt.savefig('http_duration_cdf_comparison.png')
plt.show()
