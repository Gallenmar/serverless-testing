import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

# data_sources = {
#     'Lambda': {'file': 'new_results/10_10_wdb_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
#     'EC2': {'file': 'new_results/10_10_wdb_ec2.csv', 'color': '#2271b3', 'axis': 'top'},
#     'Workers': {'file': 'new_results/10_10_wdb_worker.csv', 'color': '#ff7f0e', 'axis': 'bottom'}
# }
# title = "Zemas slodzes tests ar datubāzi - Lambda vs EC2 vs Workers"

# data_sources = {
#     'Lambda ASV': {'file': 'new_results/10_10_nodb_lambda_us_location.csv', 'color': '#ffd700', 'axis': 'bottom'},
#     'Lambda ES': {'file': 'new_results/10_10_nodb_lambda_eu_location.csv', 'color': '#ff7f0e', 'axis': 'top'}
# }
# title = "Lokacijas tests bez datubāzes - Lambda ASV vs Lambda ES" 

data_sources = {
    'Workers': {'file': 'new_results/soak_worker.csv', 'color': '#ff7f0e', 'axis': 'bottom'},
    'Lambda': {'file': 'new_results/soak_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
    'EC2': {'file': 'new_results/soak_ec2.csv', 'color': '#2271b3', 'axis': 'top'}
}
title = "Izturības tests tests ar datubāzi - Workers"

fig, ax1 = plt.subplots(figsize=(12, 6))
ax2 = ax1.twiny()

max_duration = 0
for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path)
    
    duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
    duration_values = duration_data["metric_value"].values / 1000
    max_duration = max(max_duration, np.max(duration_values))
    request_numbers = np.arange(1, len(duration_values) + 1)
    
    error_codes = duration_data["error_code"].notna().values
    
    ax = ax1 if source['axis'] == 'bottom' else ax2
    
    mask = ~error_codes
    ax.plot(request_numbers[mask], duration_values[mask], 'o', markersize=2,
            color=source['color'], alpha=0.6, zorder=2)
    
    mask = error_codes
    ax.plot(request_numbers[mask], duration_values[mask], 'o', markersize=2,
            color='red', alpha=0.6, zorder=3)
    
    ax.plot(request_numbers, duration_values, '-', linewidth=1,
            color=source['color'], label=f"{name} ({len(duration_values)} pieprasījumi)", zorder=2)
    
    ax.set_xlim(0, len(request_numbers))
    
    if source['axis'] == 'bottom':
        ax.set_xlabel(f'Lambda ASV pieprasījumu skaits', color=source['color'])
        ax.tick_params(axis='x', colors=source['color']) 
    else:
        ax.set_xlabel(f'Lambda ES pieprasījumu skaits', color=source['color'])
        ax.tick_params(axis='x', colors=source['color'])
    
    print(f"\n{name} Statistika:")
    print(f"Minimālais ilgums: {np.min(duration_values):.3f} s")
    print(f"Vidējais ilgums: {np.mean(duration_values):.3f} s")
    print(f"Mediāna: {np.median(duration_values):.3f} s")
    print(f"95. percentilis: {np.percentile(duration_values, 95):.3f} s")
    print(f"99. percentilis: {np.percentile(duration_values, 99):.3f} s")
    print(f"Maksimālais ilgums: {np.max(duration_values):.3f} s")
    print(f"Kopējais pieprasījumu skaits: {len(duration_values)}")

ax1.set_ylim(bottom=0, top=max_duration*1.1)
ax1.axhline(y=max_duration, color='gray', linestyle=':', label=f'Maksimalais laiks: {max_duration:.2f} sekundes', zorder=1)
ax1.set_ylabel('HTTP pieprasījuma ilgums (sekundes)')
ax1.grid(True, ls="-", alpha=0.2)

def seconds_formatter(x, p):
    return f'{x:.3f}s'

ax1.yaxis.set_major_formatter(plt.FuncFormatter(seconds_formatter))

plt.title(title)

lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper right')

plt.tight_layout()

plt.savefig('http_duration_requests.png')
plt.show()
