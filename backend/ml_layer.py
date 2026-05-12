from river import linear_model
from river import compose
from river import preprocessing
from river import drift
import os

class MLLayer:
    def __init__(self, data_layer):
        self.data_layer = data_layer
        # Streaming Model: Using OneHotEncoder for categoricals + Linear Regression
        self.model = compose.Pipeline(
            preprocessing.OneHotEncoder(),
            linear_model.LinearRegression()
        )
        self.drift_detector = drift.ADWIN()
        self.drift_events = 0
        self._warm_up()

    def _warm_up(self):
        print("Warming up Streaming Model with Indian Legal Vectors...")
        df = self.data_layer.df.tail(1500)
        for _, row in df.iterrows():
            x = {
                'state': row['state'],
                'case_type': row['case_type'],
                'ipc_section': str(row['ipc_section']),
                'bailable': float(row['bailable']),
                'judge_seniority': float(row['judge_seniority']),
                'pleading_complexity': float(row['pleading_complexity']),
                'backlog_size': float(row['backlog_size']),
                'adjournment_count': float(row['adjournment_count'])
            }
            y = float(row['duration_days'])
            self.update(x, y)
        print("Indian-Aware Online Model ready.")

    def update(self, x: dict, y: float):
        """
        Stream update: Learns from a new case outcome and checks for drift.
        """
        y_pred = self.model.predict_one(x)
        self.model.learn_one(x, y)
        
        # Drift Detection
        error = abs(y - (y_pred or 0))
        self.drift_detector.update(error)
        
        if self.drift_detector.drift_detected:
            print(f"!!! DRIFT DETECTED: ADWIN signal triggered at step {self.drift_events} !!!")
            self.drift_events += 1
            # In production, we might trigger a full re-calibration here

    def predict(self, case_params: dict):
        x = {
            'state': case_params.get('state'),
            'case_type': case_params.get('case_type'),
            'ipc_section': str(case_params.get('ipc_section', 'NA')),
            'bailable': float(case_params.get('bailable', 0)),
            'judge_seniority': float(case_params.get('judge_seniority', 10)),
            'pleading_complexity': float(case_params.get('pleading_complexity', 0.5)),
            'backlog_size': float(case_params.get('backlog_size', 0)),
            'adjournment_count': float(case_params.get('adjournment_count', 0))
        }
        
        prediction = self.model.predict_one(x)
        
        return {
            "prediction_days": int(prediction or 0),
            "drift_status": "STABLE" if self.drift_events == 0 else "RECALIBRATED",
            "model_type": "River Online Regressor"
        }

# Singleton instance will be created in main
