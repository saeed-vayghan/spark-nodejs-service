#!/bin/bash

# You can also pass the job ID as an argument to the script
JOB_ID=$1

fetch_and_display_info() {
  JOB_STATUS=$(curl -s "http://localhost:3000/jobs/$JOB_ID")
  JOB_STATE=$(echo $JOB_STATUS | jq -r '.state')
  START_TIME=$(echo $JOB_STATUS | jq -r '.startTime')
  END_TIME=$(echo $JOB_STATUS | jq -r '.endTime')
  DURATION="N/A"
  
  if [ "$END_TIME" != "null" ]; then
    DURATION=$(($(date -d "$END_TIME" +%s) - $(date -d "$START_TIME" +%s)))
  fi

  echo "Job Details for Job ID: $JOB_ID"
  echo "==============================="
  echo "Job State: $JOB_STATE"
  echo "Start Time: $START_TIME"
  echo "End Time: $END_TIME"
  echo "Duration: $DURATION seconds"
  
  LOG_RESPONSE=$(curl -s "http://localhost:3000/jobs/$JOB_ID/logs")
  LOGS=$(echo $LOG_RESPONSE | jq -r '.log[]')
  echo "Job Logs:"
  echo "==============================="
  echo "$LOGS"
  echo
}

check_job_status_and_logs() {
  while true; do
    JOB_STATUS=$(curl -s "http://localhost:3000/jobs/$JOB_ID")
    JOB_STATE=$(echo $JOB_STATUS | jq -r '.state')
    START_TIME=$(echo $JOB_STATUS | jq -r '.startTime')
    END_TIME=$(echo $JOB_STATUS | jq -r '.endTime')
    DURATION="N/A"
    
    if [ "$END_TIME" != "null" ]; then
      DURATION=$(($(date -d "$END_TIME" +%s) - $(date -d "$START_TIME" +%s)))
    fi

    echo "Checking Job Status for Job ID: $JOB_ID"
    echo "Job State: $JOB_STATE"
    echo "Start Time: $START_TIME"
    echo "End Time: $END_TIME"
    echo "Duration: $DURATION seconds"
    
    if [ "$JOB_STATE" == "success" ] || [ "$JOB_STATE" == "dead" ]; then
      echo "Job State is $JOB_STATE. Fetching final logs..."
      fetch_and_display_info
      break
    fi
    
    sleep 5
  done
}

check_job_status_and_logs