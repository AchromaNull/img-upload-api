#!/bin/bash
ID='ObjectId("62729359e54f2ec6203d49da")'
TOKEN="07cd281b38ffa33d6b3a69948181c925"

API="http://localhost:4741"
URL_PATH="/delete"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}"

echo
