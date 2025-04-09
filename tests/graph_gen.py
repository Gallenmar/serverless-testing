import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

# Last graph comparing wdb with nodb
# data_sources = {
#     'Lambda augstas slodze': {'file': 'results/1000_10_nodb_lambda.csv', 'color': '#ff9933'},
#     'EC2 augstas slodze': {'file': 'results/1000_10_nodb_ec2.csv', 'color': '#3498db'},
#     'Lambda zema slodze': {'file': 'results/10_10_nodb_lambda.csv', 'color': '#ff0000'},
#     'EC2 zema slodze': {'file': 'results/10_10_nodb_ec2.csv', 'color': '#0000ff'}
# }
# title = "Augstas un zemas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"


# data_sources = {
#     'Lambda': {'file': 'results/10_10_nodb_lambda.csv', 'color': '#ff0'},
#     'EC2': {'file': 'results/10_10_nodb_ec2.csv', 'color': '#3498db'},
#     'Workers': {'file': 'results/10_10_nodb_workers.csv', 'color': '#ff9933'}
# }
# title = "Zemasslodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# New Results

# data_sources = {
#     'Lambda': {'file': 'new_results/10_10_nodb_lambda_2.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/10_10_ec2_base.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/10_10_worker_base.csv', 'color': '#ff7f0e'}
# }
# title = "Zemas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/10_10_wdb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/10_10_wdb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/10_10_wdb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Zemas slodzes tests ar datubāzi - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/1000_10_nodb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/1000_10_nodb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/1000_10_nodb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Augstas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/10000_10_nodb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/10000_10_nodb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/10000_10_nodb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Ļoti augstas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/5000_10_nodb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/5000_10_nodb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/5000_10_nodb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Ļoti augstas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/5000_10_nodb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/5000_10_nodb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/5000_10_nodb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Ļoti augstas slodzes tests bez datubāzes - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda': {'file': 'new_results/1000_10_wdb_lambda.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/1000_10_wdb_ec2.csv', 'color': '#2271b3'},
#     'Workers': {'file': 'new_results/1000_10_wdb_worker.csv', 'color': '#ff7f0e'}
# }
# title = "Augstas slodzes tests ar datubāzi - Lambda vs EC2 vs Workers" 

# data_sources = {
#     'Lambda ASV': {'file': 'new_results/10_10_nodb_lambda_us_location.csv', 'color': '#ffd700'},
#     'Lambda ES': {'file': 'new_results/10_10_nodb_lambda_eu_location.csv', 'color': '#ff7f0e'}
# }
# title = "Augstas slodzes tests ar datubāzi - Lambda vs EC2 vs Workers" 

# data_sources = {
#     'Workers': {'file': 'new_results/ramp_iot_worker_800.csv', 'color': '#ff7f0e', 'axis': 'bottom'},
#     'Lambda': {'file': 'new_results/ramp_iot_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
#     'EC2': {'file': 'new_results/ramp_iot_ec2.csv', 'color': '#2271b3', 'axis': 'top'}
# }
# title = "Neregulārs tests ar datubāzi - Lambda vs EC2 vs Workers"

data_sources = {
    'Workers': {'file': 'new_results/warehouse_worker_2.csv', 'color': '#ff7f0e', 'axis': 'bottom'},
    'Lambda': {'file': 'new_results/warehouse_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
    'EC2': {'file': 'new_results/warehouse_ec2.csv', 'color': '#2271b3', 'axis': 'top'}
}
title = "Augstas skaitļošanas uzdevums - Lambda vs EC2 vs Workers"

plt.figure(figsize=(10, 6))

all_durations = [] 
source_durations = {}

plt.xscale('log')

def generate_grid_lines(min_val, max_val):
    # Handle edge cases
    if min_val <= 0:
        min_val = 0.001  # Set a small positive value instead of zero
    
    if not np.isfinite(max_val) or max_val <= min_val:
        max_val = min_val * 10  # Ensure max_val is finite and greater than min_val
    
    min_exp = np.floor(np.log10(min_val))
    max_exp = np.ceil(np.log10(max_val))
    
    grid_lines = []
    for exp in range(int(min_exp), int(max_exp + 1)):
        base = 10 ** exp
        grid_lines.extend([base * x for x in [1, 2, 5]])
    
    return [x for x in grid_lines if min_val <= x <= max_val]

for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path, low_memory=False)
    
    # Fix the corrupted line
    duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
    duration_values = duration_data["metric_value"].values / 1000
    
    # Ensure no zero or negative values
    duration_values = np.maximum(duration_values, 0.001)
    
    error_codes = duration_data["error_code"].notna().values
    sorted_indices = np.argsort(duration_values)
    error_codes = error_codes[sorted_indices]
    
    # Filter out data points with error codes
    mask = ~error_codes
    valid_durations = duration_values[mask]
    
    all_durations.extend(valid_durations)
    source_durations[name] = {
        'values': valid_durations,
        'mean': np.mean(valid_durations)
    }
    
    sorted_durations = np.sort(valid_durations)
    cumulative_prob = np.arange(1, len(sorted_durations) + 1) / len(sorted_durations)
    
    # Only plot valid data points (without error codes)
    plt.plot(sorted_durations, cumulative_prob, 'o', markersize=2, color=source['color'], alpha=0.6, zorder=2)
    plt.plot(sorted_durations, cumulative_prob, '-', linewidth=1, color=source['color'], label=name, zorder=2)
    
    print(f"\n{name} Statistika:")
    print(f"Minimālais ilgums: {np.min(valid_durations):.3f} s")
    print(f"Mediāna: {np.median(valid_durations):.3f} s")
    print(f"Vidējais ilgums: {np.mean(valid_durations):.3f} s")
    print(f"95. percentilis: {np.percentile(valid_durations, 95):.3f} s")
    print(f"99. percentilis: {np.percentile(valid_durations, 99):.3f} s")
    print(f"Maksimālais ilgums: {np.max(valid_durations):.3f} s")

# Add a check before generating grid lines
if len(all_durations) > 0:
    grid_lines_s = generate_grid_lines(min(all_durations), max(all_durations))
    plt.vlines(grid_lines_s, 0, 1, colors='lightgrey', linestyles='-', alpha=0.5, zorder=1)
else:
    print("Warning: No duration data found in any of the sources.")
    grid_lines_s = []

percentiles = [0, 0.25, 0.50, 0.75, 0.90, 0.95, 1]
if len(all_durations) > 0:
    plt.hlines(percentiles, min(all_durations), max(all_durations), colors='lightgrey', linestyles='-', alpha=0.5, zorder=1)
else:
    # Skip horizontal lines if no data
    pass

plt.grid(False)

plt.xlabel('HTTP pieprasījuma ilgums (s)')
plt.ylabel('Kumulatīvā varbūtība')
plt.title(title)

x_ticks = set()
x_labels = {}

if grid_lines_s:
    for val in grid_lines_s:
        x_ticks.add(val)
        x_labels[val] = f'{val:.3f}'

    x_ticks = sorted(list(x_ticks))
    x_tick_labels = [x_labels[x] for x in x_ticks]

    plt.xticks(x_ticks, x_tick_labels, rotation=45)
else:
    # Default ticks if no grid lines
    plt.xticks([])

plt.yticks(percentiles, ['0%', '25%', '50%', '75%', '90%', '95%', '100%'])

plt.legend(loc='lower right')

plt.tight_layout()

plt.savefig('http_duration_cdf_comparison.png')
plt.show()
