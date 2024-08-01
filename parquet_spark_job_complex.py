from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, sum as spark_sum, avg as spark_avg, count as spark_count
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger("ParquetSQLJob")

def main():
    logger.info("Starting Spark session")
    spark = SparkSession.builder \
        .appName("ParquetSQL") \
        .master("spark://spark-master:7077") \
        .config("spark.executor.memory", "2g") \
        .config("spark.driver.memory", "2g") \
        .getOrCreate()

    # Path to the Parquet file
    parquet_file = "/opt/livy/users.parquet"

    logger.info(f"Reading Parquet file from {parquet_file}")

    try:
        # Read the Parquet file
        df = spark.read.parquet(parquet_file)
        logger.info("Parquet file successfully read.")

        # Print schema of the DataFrame
        df.printSchema()

        # Perform basic validation
        num_records = df.count()
        logger.info(f"Number of records: {num_records}")

        # Show the first few records
        df.show()

        # Explode the transactions to flatten the nested structure
        exploded_df = df.select(
            col("user_id"),
            col("user_name"),
            col("age"),
            explode(col("transactions")).alias("transaction")
        ).select(
            col("user_id"),
            col("user_name"),
            col("age"),
            col("transaction.transaction_id").alias("transaction_id"),
            col("transaction.amount").alias("amount"),
            col("transaction.date").alias("date")
        )

        exploded_df.show()

        # Aggregate transactions and compute statistics
        aggregated_df = exploded_df.groupBy("user_id", "user_name", "age").agg(
            spark_sum("amount").alias("total_amount"),
            spark_avg("amount").alias("average_amount"),
            spark_count("transaction_id").alias("num_transactions")
        )

        aggregated_df.show()

        # Perform a SQL operation
        exploded_df.createOrReplaceTempView("transactions")
        sql_result_df = spark.sql(
            "SELECT user_name, COUNT(*) as num_transactions, SUM(amount) as total_amount "
            "FROM transactions GROUP BY user_name"
        )

        sql_result_df.show()

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
    finally:
        spark.stop()
        logger.info("Spark session stopped.")

if __name__ == "__main__":
    main()