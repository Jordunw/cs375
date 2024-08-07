#!/bin/sh

if [ $# -lt 1 ]; then
    echo "client secret key must be provided as an argument"
    exit 1
fi

curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=0f4344f0405a493e9060107a79b78903&client_secret=${1}" > key.json