import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))

# data_sources = {
#     'Workers': {'file': 'new_results/soak_worker_nodb.csv', 'color': '#ff7f0e'},
#     'Lambda': {'file': 'new_results/soak_lambda_nodb.csv', 'color': '#ffd700'},
#     'EC2': {'file': 'new_results/soak_ec2_nodb.csv', 'color': '#2271b3'} 
# }
# title = "Izturības tests - Pieprasījuma ilgums pēc laika"

data_sources = {
    'Workers': {'file': 'new_results/warehouse_worker_2.csv', 'color': '#ff7f0e', 'axis': 'bottom'},
    'Lambda': {'file': 'new_results/warehouse_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
    'EC2': {'file': 'new_results/warehouse_ec2.csv', 'color': '#2271b3', 'axis': 'top'}
}
title = "Augstas skaitļošanas uzdevums - Lambda vs EC2 vs Workers"

# Create a 3x1 grid of subplots (one for each service)
fig, axes = plt.subplots(3, 1, figsize=(12, 15))

# Calculate max duration for consistent y-axis scaling
all_durations = []
for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path, low_memory=False)
    duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
    duration_values = duration_data["metric_value"].values / 1000
    all_durations.extend(duration_values)

max_duration = np.max(all_durations) if all_durations else 1
max_elapsed_time = 0

# Process each data source and plot on its dedicated subplot
for i, (name, source) in enumerate(data_sources.items()):
    ax = axes[i]
    
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path, low_memory=False)
    
    duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
    
    # Convert Unix timestamps to numeric
    timestamps = pd.to_numeric(duration_data["timestamp"])
    
    # Normalize timestamps to start from 0 for better visualization
    start_time = timestamps.min()
    time_elapsed = np.array(timestamps - start_time)
    max_elapsed_time = max(max_elapsed_time, time_elapsed.max() if len(time_elapsed) > 0 else 0)
    
    # Convert duration from ms to seconds
    duration_values = np.array(duration_data["metric_value"].values / 1000)
    
    # Mark error points - check both error_code and error columns with improved detection
    # First make sure we handle different data types properly
    try:
        error_codes = np.array(duration_data["error_code"].notna().values)
    except:
        error_codes = np.zeros(len(duration_values), dtype=bool)
        
    try:
        # Also check for empty strings to ensure we catch all error types
        error_messages = np.array(duration_data["error"].notna().values)
        # Some errors might be empty strings which are not NaN
        empty_check = np.array([False if pd.isna(err) or str(err).strip() == "" 
                                else True for err in duration_data["error"]])
        error_messages = np.logical_or(error_messages, empty_check)
    except:
        error_messages = np.zeros(len(duration_values), dtype=bool)
    
    # A request is failed if either error_code or error is not empty
    failed_requests = np.logical_or(error_codes, error_messages)
    
    # First plot the connecting line with lower zorder
    ax.plot(time_elapsed, duration_values, '-', linewidth=1,
            color=source['color'], alpha=0.5,
            label=f"{name} ({len(duration_values)} pieprasījumi)", zorder=1)
    
    # Plot regular (successful) points
    mask = ~failed_requests
    if np.any(mask):
        ax.plot(time_elapsed[mask], duration_values[mask], 'o', markersize=3,
                color=source['color'], alpha=0.7, zorder=2)
    
    # Plot error points in red with higher zorder and larger size for visibility
    if np.any(failed_requests):
        ax.plot(time_elapsed[failed_requests], duration_values[failed_requests], 'o', 
                markersize=4, color='red', alpha=1.0, zorder=3, 
                label='Kļūdas')
    
    # Add a horizontal line at the service's max duration
    if len(duration_values) > 0:
        service_max = np.max(duration_values)
        ax.axhline(y=service_max, color='gray', linestyle=':', 
                label=f'Maksimalais laiks: {service_max:.2f} sekundes', zorder=1)
    
    # Configure the subplot
    ax.set_title(f"({chr(65+i)}) {name} - Pieprasījuma ilgums pēc laika")
    ax.set_ylabel('HTTP pieprasījuma ilgums (sekundes)')
    ax.grid(True, ls="-", alpha=0.2)
    ax.legend(loc='lower right')
    
    # Set logarithmic scale for y-axis
    ax.set_yscale('log')
    
    # Format y-axis to show seconds - adjusted for log scale
    def seconds_formatter(x, p):
        if x < 0.001:
            return f'{x*1000:.1f}ms'
        return f'{x:.3f}s'
    
    ax.yaxis.set_major_formatter(plt.FuncFormatter(seconds_formatter))
    
    # With logarithmic scale, we need to be careful with limits
    # Ensure the minimum is a positive value
    min_duration = np.min(duration_values) if len(duration_values) > 0 else 0.001
    min_y = max(0.001, min_duration * 0.5)  # Ensure positive min value, give some space
    
    # Set y-axis limits for consistency across subplots
    ax.set_ylim(bottom=min_y, top=max_duration*2)
    
    # Add grid lines appropriate for log scale
    ax.grid(True, which='both', ls="-", alpha=0.2)
    ax.grid(True, which='minor', ls=":", alpha=0.1)
    
    # Print statistics for this service
    print(f"\n{name} Statistika:")
    if len(duration_values) > 0:
        print(f"Minimālais ilgums: {np.min(duration_values):.3f} s")
        print(f"Vidējais ilgums: {np.mean(duration_values):.3f} s")
        print(f"Mediāna: {np.median(duration_values):.3f} s")
        print(f"95. percentilis: {np.percentile(duration_values, 95):.3f} s")
        print(f"99. percentilis: {np.percentile(duration_values, 99):.3f} s")
        print(f"Maksimālais ilgums: {np.max(duration_values):.3f} s")
    print(f"Kopējais pieprasījumu skaits: {len(duration_values)}")
    print(f"Testa ilgums: {timestamps.max() - timestamps.min() if len(timestamps) > 0 else 0:.1f} sekundes")

    # Print error statistics
    total_errors = np.sum(failed_requests)
    error_rate = (total_errors / len(duration_values)) * 100 if len(duration_values) > 0 else 0
    print(f"Kļūdu skaits: {total_errors} ({error_rate:.2f}%)")

# Set x-axis label only on the bottom subplot to avoid redundancy
axes[-1].set_xlabel('Laiks (sekundes)')

# Make sure all x-axes have the same scale for fair comparison
for ax in axes:
    ax.set_xlim(0, max_elapsed_time)

# Add an overall title to the figure
fig.suptitle(title, fontsize=16)

# Adjust layout to prevent overlap
plt.tight_layout(rect=[0, 0, 1, 0.97])  # Leave space for the overall title
plt.savefig('http_duration_vs_timestamp_grid.png')
plt.show()