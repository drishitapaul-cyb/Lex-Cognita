import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_data(n=10000):
    np.random.seed(42)
    
    states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']
    case_types = ['Civil', 'Criminal', 'Commercial', 'Family', 'Property']
    ipc_mapping = {
        '302': 'Murder',
        '420': 'Cheating',
        '498A': 'Domestic Violence',
        '376': 'Sexual Offense',
        '323': 'Hurt'
    }
    
    data = []
    
    for i in range(n):
        state = np.random.choice(states)
        district = f"{state}_District_{np.random.randint(1, 10)}"
        case_type = np.random.choice(case_types)
        
        # Indian Legal Features
        ipc_section = np.random.choice(list(ipc_mapping.keys())) if case_type == 'Criminal' else 'NA'
        bailable = np.random.choice([0, 1]) if case_type == 'Criminal' else 0
        judge_seniority = np.random.randint(2, 25)
        pleading_complexity = np.random.uniform(0.1, 1.0)
        pleading_sentiment = np.random.uniform(-0.8, 0.8)
        adjournments = np.random.randint(2, 25)
        backlog_size = np.random.randint(500, 6000)

        # Base duration depends on case type
        base_duration = {
            'Civil': 850,
            'Criminal': 1100,
            'Commercial': 600,
            'Family': 450,
            'Property': 950
        }[case_type]
        
        # ⚖️ Indian Factor Impacts
        duration = base_duration
        duration += (1.0 - bailable) * 180  # Non-bailable adds 6 months
        duration += (25 - judge_seniority) * 20 # Junior judges may take longer
        duration += (pleading_complexity * 300) # Complex pleadings delay process
        duration += (backlog_size / 50) * 15
        duration += (adjournments * 40)
        
        # Add noise
        duration = int(duration + np.random.normal(0, 120))
        
        filing_date = datetime(2019, 1, 1) + timedelta(days=np.random.randint(0, 1500))
        disposal_date = filing_date + timedelta(days=duration)
        
        data.append({
            'case_id': f'CAS-{10000+i}',
            'state': state,
            'district': district,
            'case_type': case_type,
            'ipc_section': ipc_section,
            'bailable': bailable,
            'judge_seniority': judge_seniority,
            'pleading_complexity': round(pleading_complexity, 2),
            'pleading_sentiment': round(pleading_sentiment, 2),
            'filing_date': filing_date.strftime('%Y-%m-%d'),
            'disposal_date': disposal_date.strftime('%Y-%m-%d'),
            'judge_id': f'JDG-{np.random.randint(1, 50)}',
            'adjournment_count': adjournments,
            'backlog_size': backlog_size,
            'outcome': np.random.choice(['Settled', 'Allowed', 'Dismissed']),
            'duration_days': max(100, duration)
        })
        
    df = pd.DataFrame(data)
    df.to_csv('backend/cases.csv', index=False)
    print(f"Generated {n} Indian-focused cases in backend/cases.csv")

if __name__ == "__main__":
    import os
    if not os.path.exists('backend'):
        os.makedirs('backend')
    generate_data()
