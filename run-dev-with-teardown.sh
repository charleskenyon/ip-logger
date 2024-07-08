#!/bin/bash

function teardown {
  echo "SIGINT received. Removing resources..."
  sst remove --stage=dev
  exit 0
}

trap teardown SIGINT

sst dev --stage=dev --verbose=true