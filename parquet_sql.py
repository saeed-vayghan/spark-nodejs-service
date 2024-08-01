import pyarrow.parquet as pq
import json
from collections import defaultdict

def read_parquet_file(parquet_file):
    try:
        table = pq.read_table(parquet_file)
        
        records = table.to_pylist()

        for record in records:
            print(json.dumps(record, indent=4, default=str))
        
        user_aggregations = defaultdict(lambda: {"total_transactions": 0, "total_amount": 0.0})

        # Perform aggregations
        for record in records:
            user_id = record["user_id"]
            for transaction in record["transactions"]:
                user_aggregations[user_id]["total_transactions"] += 1
                user_aggregations[user_id]["total_amount"] += transaction["amount"]

        print("\nAggregated Results:")
        print(json.dumps(user_aggregations, indent=4, default=str))

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    parquet_file = "/opt/livy/users.parquet"
    read_parquet_file(parquet_file)