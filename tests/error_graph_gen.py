import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

data_sources = {
    'Bez gaidīšanas': {'file': 'results/1000_10_wdb_lambda.csv', 'color': '#ff9933'},
    'Īsa gaidīšana': {'file': 'results/1000_10_wdb_retry_lambda.csv', 'color': '#ffff00'},
    'Ilga gaidīšana': {'file': 'results/1000_10_wdb_long_retry_lambda.csv', 'color': '#ffff00'},
    'Līdz 1500ms gaidīšana': {'file': 'results/1000_10_wdb_1500_retry_lambda.csv', 'color': '#ffff00'},
    'Gaidīšana klientu pusē 5s': {'file': 'results/1000_10_wdb_client_retry_lambda.csv', 'color': '#3498db'},
    'Gaidīšana klientu pusē 100ms': {'file': 'results/1000_10_wdb_client_01_retry_lambda.csv', 'color': '#3498db'},
}

plt.figure(figsize=(8, 6))

error_percentages = []
names = []

for name, source in data_sources.items():
    file_path = os.path.join(script_dir, source['file'])
    df = pd.read_csv(file_path)
    
    if name in ['Gaidīšana klientu pusē 5s', 'Gaidīšana klientu pusē 100ms']:
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

plt.title("Veiksmes pieprasījumu procentuālā daļa")
plt.ylabel("Veiksmes īpatsvars (%)")
plt.ylim(0, max(error_percentages) * 1.2)

plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()

plt.savefig('http_error_percentage.png')
plt.show()
