import pandas as pd
import numpy as np
import os
from pathlib import Path

class DataLayer:
    def __init__(self, csv_path: str):
        self.csv_path = Path(csv_path)
        self.df = pd.read_csv(self.csv_path)
        self.df['filing_date'] = pd.to_datetime(self.df['filing_date'])
        self.df['disposal_date'] = pd.to_datetime(self.df['disposal_date'])
        
    def get_filtered_data(self, filters: dict):
        temp_df = self.df.copy()
        for key, value in filters.items():
            if key in temp_df.columns and value:
                temp_df = temp_df[temp_df[key] == value]
        return temp_df

    def compute_percentiles(self, df: pd.DataFrame):
        if df.empty:
            return {"p10": 0, "p50": 0, "p90": 0}
        
        durations = df['duration_days']
        return {
            "p10": int(np.percentile(durations, 10)),
            "p50": int(np.percentile(durations, 50)),
            "p90": int(np.percentile(durations, 90))
        }

    def compute_backlog_percentile(self, backlog_size: int, state: str = None):
        df = self.df
        if state:
            df = df[df['state'] == state]
        
        if df.empty:
            return 0.5
            
        return (df['backlog_size'] < backlog_size).mean()

csv_path = 'cases.csv'
if not os.path.exists(csv_path):
    csv_path = 'data/cases.csv'
if not os.path.exists(csv_path):
    csv_path = '../backend/cases.csv'

data_layer = DataLayer(csv_path)
