import pandas as pd
import numpy as np
import networkx as nx
import faiss
import os

class GraphLayer:
    def __init__(self, data_layer):
        self.data_layer = data_layer
        self.graph = nx.Graph()
        self.index = None
        # _seq_df stores the 500-row subset in sequential order
        # so FAISS internal position i == _seq_df.iloc[i]
        self._seq_df = None
        self._build_and_index()

    def _build_and_index(self):
        print("Building Case Graph and Indexing Embeddings...")
        try:
            from node2vec import Node2Vec
        except ImportError:
            print("[GraphLayer] node2vec not installed — graph disabled.")
            return

        try:
            # Use a reset-indexed slice so positions 0..N-1 are reliable
            df = self.data_layer.df.copy().head(500).reset_index(drop=True)
            self._seq_df = df

            # 1. Build Graph — nodes keyed by sequential position
            for pos in range(len(df)):
                case_id = f"CASE_{pos}"
                self.graph.add_node(case_id)

            # Edges: cases sharing same case_type within the subset
            if 'case_type' in df.columns:
                for case_type in df['case_type'].unique():
                    positions = df.index[df['case_type'] == case_type].tolist()
                    for i in range(len(positions) - 1):
                        self.graph.add_edge(f"CASE_{positions[i]}", f"CASE_{positions[i+1]}", weight=1.0)

            # 2. Generate Embeddings via Node2Vec
            node2vec = Node2Vec(self.graph, dimensions=64, walk_length=20, num_walks=10, workers=1, quiet=True)
            model = node2vec.fit(window=10, min_count=1, batch_words=4)

            embeddings = np.array(
                [model.wv[f"CASE_{pos}"] for pos in range(len(df))]
            ).astype('float32')

            # 3. Index in FAISS — position i in index == df.iloc[i]
            self.index = faiss.IndexFlatL2(64)
            self.index.add(embeddings)
            print(f"[GraphLayer] Indexed {len(df)} nodes.")

        except Exception as e:
            print(f"[GraphLayer] Build failed: {e}")
            self.index = None

    def get_similar_cases(self, case_params: dict, top_k: int = 3):
        """
        Retrieve similar cases by graph proximity.
        Uses the first case of the matching type as the query anchor.
        """
        if self.index is None or self._seq_df is None:
            return []

        try:
            df = self._seq_df
            case_type = case_params.get('case_type', '')

            if 'case_type' in df.columns and case_type:
                subset = df[df['case_type'] == case_type]
            else:
                subset = df

            if subset.empty:
                subset = df

            # anchor_pos is a valid sequential position (0 .. len(df)-1)
            anchor_pos = int(subset.index[0])
            anchor_vec = self.index.reconstruct(anchor_pos).reshape(1, -1)

            D, I = self.index.search(anchor_vec, top_k + 1)  # +1 to skip self

            results = []
            for rank, (dist, pos) in enumerate(zip(D[0], I[0])):
                if pos == anchor_pos:
                    continue  # skip self
                if pos < 0 or pos >= len(df):
                    continue
                row = df.iloc[pos]
                dur = row.get('duration_days', 0) if hasattr(row, 'get') else row['duration_days']
                results.append({
                    "case_id": f"PRC-{pos:04d}",
                    "duration": int(dur),
                    "outcome": "Disposed",
                    "similarity": round(float(1.0 / (1.0 + dist)), 3),
                })
                if len(results) >= top_k:
                    break

            return results
        except Exception as e:
            print(f"[GraphLayer] get_similar_cases error: {e}")
            return []

# Singleton instance will be created in main.py
