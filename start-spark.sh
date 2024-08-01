#!/bin/sh

$SPARK_HOME/sbin/start-master.sh
$SPARK_HOME/sbin/start-worker.sh spark://$(hostname -i):7077

tail -f /dev/null