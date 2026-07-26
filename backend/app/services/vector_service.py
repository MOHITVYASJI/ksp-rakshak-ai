import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VectorSearchEngine:
    def __init__(self):
        self.documents = [] # List of dicts with doc_id, text, metadata
        self.vectorizer = None
        self.doc_vectors = None

    def build_vector_index(self, firs_data: List[Dict[str, Any]]):
        """Indexes free-text FIR narratives, Modus Operandi (MO), and Spot Mahazar notes."""
        self.documents = []
        for fir in firs_data:
            combined_text = f"FIR: {fir['fir_no']}. Crime Head: {fir['crime_head']}. MO Narrative: {fir['mo_narrative']} Spot Mahazar: {fir.get('spot_mahazar', '')}"
            self.documents.append({
                "id": fir["id"],
                "fir_no": fir["fir_no"],
                "station_id": fir["station_id"],
                "crime_head": fir["crime_head"],
                "bns_sections": fir["bns_sections"],
                "text": combined_text,
                "mo_narrative": fir["mo_narrative"]
            })

        if not self.documents:
            return

        corpus = [doc["text"] for doc in self.documents]
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.doc_vectors = self.vectorizer.fit_transform(corpus)
        print(f"[VECTOR] Vector Search Engine indexed {len(self.documents)} FIR narrative documents.")

    def initialize_from_db(self, db):
        """Indexes FIR records directly from DB session if in-memory index is unpopulated."""
        try:
            from app.models.domain import FIRRecord
            firs = db.query(FIRRecord).all()
            firs_data = [{
                "id": f.id,
                "fir_no": f.fir_no,
                "station_id": f.station_id,
                "crime_head": f.crime_head,
                "bns_sections": f.bns_sections,
                "mo_narrative": f.mo_narrative,
                "spot_mahazar": f.spot_mahazar
            } for f in firs]
            self.build_vector_index(firs_data)
        except Exception as e:
            print(f"[VECTOR ERROR] Failed to initialize vector search from DB: {e}")

    def search_similar_cases(self, query: str, top_k: int = 5, db=None) -> List[Dict[str, Any]]:
        """Executes cosine similarity search across indexed FIR narratives."""
        if (self.vectorizer is None or self.doc_vectors is None) and db is not None:
            self.initialize_from_db(db)

        if self.vectorizer is None or self.doc_vectors is None:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.doc_vectors)[0]

        top_indices = similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.05: # Relevance threshold
                doc = self.documents[idx]
                results.append({
                    "fir_id": doc["id"],
                    "fir_no": doc["fir_no"],
                    "crime_head": doc["crime_head"],
                    "bns_sections": doc["bns_sections"],
                    "mo_narrative": doc["mo_narrative"],
                    "score": round(score, 4)
                })

        return results

# Global Instance
vector_engine = VectorSearchEngine()
