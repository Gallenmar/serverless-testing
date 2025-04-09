import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

# data_sources = {
#     'Bez gaidīšanas': {'file': 'results/1000_10_wdb_lambda.csv', 'color': '#ff9933'},
#     'Īsa gaidīšana': {'file': 'results/1000_10_wdb_retry_lambda.csv', 'color': '#ffff00'},
#     'Ilga gaidīšana': {'file': 'results/1000_10_wdb_long_retry_lambda.csv', 'color': '#ffff00'},
#     'Līdz 1500ms gaidīšana': {'file': 'results/1000_10_wdb_1500_retry_lambda.csv', 'color': '#ffff00'},
#     'Gaidīšana klientu pusē 5s': {'file': 'results/1000_10_wdb_client_retry_lambda.csv', 'color': '#3498db'},
#     'Gaidīšana klientu pusē 100ms': {'file': 'results/1000_10_wdb_client_01_retry_lambda.csv', 'color': '#3498db'},
# }

data_sources = {
    # 'Zema slodze bez datubāzes': {'file': 'new_results/10_10_lambda_base.csv', 'color': '#ffd700'},
    'Zema slodze ar datubāzi Lambda': {'file': 'new_results/10_10_wdb_lambda.csv', 'color': '#ffd700'},
    # 'Augsta slodze bez datubāzes': {'file': 'new_results/1000_10_nodb_lambda.csv', 'color': '#ffd700'},
    'Augsta slodze ar datubāzi Lambda': {'file': 'new_results/1000_10_wdb_lambda_5.csv', 'color': '#ffd700'},
    # 'Zema slodze EC2': {'file': 'new_results/10_10_ec2_base.csv', 'color': '#2271b3'},
    'Zema slodze ar datubāzi EC2': {'file': 'new_results/10_10_wdb_ec2.csv', 'color': '#2271b3'},
    # 'Augsta slodze EC2': {'file': 'new_results/1000_10_nodb_ec2.csv', 'color': '#2271b3'},
    'Augsta slodze ar datubāzi EC2': {'file': 'new_results/1000_10_wdb_ec2.csv', 'color': '#2271b3'},
    # 'Zema slodze Workers': {'file': 'new_results/10_10_worker_base.csv', 'color': '#ff7f0e'},
    'Zema slodze ar datubāzi Workers': {'file': 'new_results/10_10_wdb_worker.csv', 'color': '#ff7f0e'},
    # 'Augsta slodze bez datubāzes Workers': {'file': 'new_results/1000_10_nodb_worker.csv', 'color': '#ff7f0e'},
    'Augsta slodze ar datubāzi Workers': {'file': 'new_results/1000_10_wdb_worker_5.csv', 'color': '#ff7f0e'},
}

# data_sources = {
#     'Bez gaidīšanas': {'file': 'new_results/1000_10_wdb_wait_no_workers.csv', 'color': '#ff9933'},
#     'Līdz 0,4s gaidīšana': {'file': 'new_results/1000_10_wdb_wait_short_workers.csv', 'color': '#ffff00'},
#     'Līdz 1s gaidīšana': {'file': 'new_results/1000_10_wdb_wait_medium_workers.csv', 'color': '#ffff00'},
#     'Līdz 40s gaidīšana': {'file': 'new_results/1000_10_wdb_wait_long_workers.csv', 'color': '#ffff00'},
#     'Gaidīšana klientu pusē 0,1s': {'file': 'new_results/1000_10_wdb_wait_client_workers.csv', 'color': '#3498db'},
# }

# data_sources = {
#     'Bez gaidīšanas': {'file': 'new_results/1000_10_wdb_lambda_us.csv', 'color': '#ff9933'},
#     'Līdz 0,4s gaidīšana': {'file': 'new_results/1000_10_wdb_lambda_us_wait_short.csv', 'color': '#ffff00'},
#     'Līdz 1s gaidīšana': {'file': 'new_results/1000_10_wdb_lambda_us_wait_medium.csv', 'color': '#ffff00'},
#     'Līdz 40s gaidīšana': {'file': 'new_results/1000_10_wdb_lambda_us_wait_long.csv', 'color': '#ffff00'},
#     'Gaidīšana klientu pusē 0,1s': {'file': 'new_results/1000_10_wdb_lambda_us_wait_client.csv', 'color': '#3498db'},
# }

data_sources = {
    'Workers': {'file': 'new_results/ramp_iot_worker_800.csv', 'color': '#ff7f0e', 'axis': 'bottom'},
    'Lambda': {'file': 'new_results/ramp_iot_lambda.csv', 'color': '#ffd700', 'axis': 'bottom'},
    'EC2': {'file': 'new_results/ramp_iot_ec2.csv', 'color': '#2271b3', 'axis': 'top'}
}
title = "Zemas slodzes tests ar datubāzi - Workers"

plt.figure(figsize=(8, 6))

error_percentages = []
names = []

for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path)
    
    if name in ['Gaidīšana klientu pusē 0,1s']:
        error_percentage = 100
        error_requests = total_requests = 0
    else:
        duration_data = df[df["metric_name"].str.contains("http_req_duration", regex=True, na=False)]
        
        total_requests = len(duration_data)
        error_requests = duration_data["error_code"].isna().sum()
        error_percentage = (error_requests / total_requests) * 100
    
    error_percentages.append(error_percentage)
    names.append(name)
    
    print(f"\n{name} Error Statistics:")
    print(f"Total Requests: {total_requests}")
    print(f"Error Requests: {error_requests}")
    print(f"Error Percentage: {error_percentage:.2f}%")

bars = plt.bar(names, error_percentages)

for bar, (name, source) in zip(bars, data_sources.items()):
    bar.set_color(source['color'])

plt.xticks(rotation=45, ha='right')

for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
            f'{height:.2f}%',
            ha='center', va='bottom')

plt.title("Veiksmīgu pieprasījumu procentuālā daļa")
plt.ylabel("Veiksmīgu pieprasījumu īpatsvars (%)")
plt.ylim(0, max(error_percentages) * 1.2)

plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()

plt.savefig('http_error_percentage.png')
plt.show()
