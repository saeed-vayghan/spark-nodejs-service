const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; 
const LIVY_URL = 'http://localhost:8998';

app.use(bodyParser.json());

// submit a Spark job to execute the Python script
app.post('/run-job', async (req, res) => {
  try {
    // spark job
    const jobData = {
      file: "local:///opt/livy/parquet_sql.py",  // Path to the job's script
      conf: {
        'spark.driver.memory': '2g',
        'spark.executor.memory': '2g'
      }
    };

    // submit the Spark job to Livy
    const response = await axios.post(`${LIVY_URL}/batches`, {
      file: jobData.file,
      conf: jobData.conf
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// check job status
app.get('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const response = await axios.get(`${LIVY_URL}/batches/${jobId}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fetch job logs
app.get('/jobs/:jobId/logs', async (req, res) => {
  const { jobId } = req.params;

  try {
    const response = await axios.get(`${LIVY_URL}/batches/${jobId}/log`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// list Spark jobs
app.get('/jobs', async (req, res) => {
  try {
    const response = await axios.get(`${LIVY_URL}/batches`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});