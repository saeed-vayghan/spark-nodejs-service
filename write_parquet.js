const parquet = require('parquetjs-lite');

async function writeParquetFile() {
  const schema = new parquet.ParquetSchema({
    user_id: { type: 'UTF8' },
    user_name: { type: 'UTF8' },
    age: { type: 'INT32' },
    transactions: {
      repeated: true,
      fields: {
        transaction_id: { type: 'UTF8' },
        amount: { type: 'DOUBLE' },
        date: { type: 'UTF8' }
      }
    }
  });

  const writer = await parquet.ParquetWriter.openFile(schema, 'users.parquet');

  await writer.appendRow({
    user_id: 'u1',
    user_name: 'Alice',
    age: 30,
    transactions: [
      { transaction_id: 't1', amount: 250.34, date: '2023-08-01' },
      { transaction_id: 't2', amount: 150.12, date: '2023-08-10' }
    ]
  });

  await writer.appendRow({
    user_id: 'u2',
    user_name: 'Bob',
    age: 35,
    transactions: [
      { transaction_id: 't3', amount: 350.45, date: '2023-08-05' }
    ]
  });

  await writer.close();
  console.log('Parquet file written successfully!');
}

writeParquetFile().catch(err => console.error('Error writing Parquet file:', err));