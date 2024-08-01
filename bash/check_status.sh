#!/bin/bash

JOB_ID=$1

check_job_status() {
  while true; do
    STATUS=$(curl -s "http://localhost:3000/jobs/$JOB_ID" | jq -r '.state')
    echo "Job state: $STATUS"
    if [ "$STATUS" == "success" ] || [ "$STATUS" == "dead" ]; then
      break
    fi
    sleep 5
  done
}

check_job_status