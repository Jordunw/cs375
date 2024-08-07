#!/bin/sh

curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=0f4344f0405a493e9060107a79b78903&client_secret=5d51a3bf55874bd7b9bde96bcbdceb8b" > key.json