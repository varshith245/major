import numpy as np
from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .data_loader import data_loader
from ..models.schemas import Scheme

class VectorEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.scheme_corpus: List[str] = []
        self.scheme_list: List[Scheme] = []
        self.matrix = None
        self._build_index()

    def _build_index(self):
        self.scheme_list = data_loader.get_all_schemes(include_inactive=False)
        self.scheme_corpus = []
        if not self.scheme_list:
            self.matrix = None
            return
        for s in self.scheme_list:
            text = f"{s.scheme_name} {s.short_name} {s.ministry} {s.category} {s.state} {s.description} {s.key_benefits} {' '.join(s.tags)} {' '.join(s.eligibility_criteria.occupation)}"
            self.scheme_corpus.append(text)
        
        self.matrix = self.vectorizer.fit_transform(self.scheme_corpus)

    def search(self, query: str, top_k: int = 5, min_threshold: float = 0.05) -> List[Tuple[Scheme, float]]:
        if not self.scheme_list or self.matrix is None:
            return []

        if not query.strip():
            active_list = [s for s in self.scheme_list if getattr(s, "status", "Active") == "Active"]
            return [(s, 1.0) for s in active_list[:top_k]]
        
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.matrix).flatten()
        top_indices = np.argsort(scores)[::-1]

        results = []
        for idx in top_indices:
            scheme = self.scheme_list[idx]
            if getattr(scheme, "status", "Active") != "Active":
                continue
            score = float(scores[idx])
            if score >= min_threshold or len(results) == 0:
                results.append((scheme, round(score, 4)))
            if len(results) >= top_k:
                break
        return results

vector_engine = VectorEngine()
